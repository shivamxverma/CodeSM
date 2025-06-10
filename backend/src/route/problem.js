import express from 'express';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { Problem } from '../models/Problem';

const router = express.Router();

router.post('/solveproblem/:id', async (req, res) => {
  const { code, language } = req.body; 
  const problemId = req.params.id;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const filename = language === "cpp" ? "Main.cpp" : "main.py";
    const filepath = path.join(__dirname, `../temp/${filename}`);
    fs.writeFileSync(filepath, code);

    const dockerImage = language === "cpp" ? "gcc" : "python";
    const compileCmd = language === "cpp" ? `g++ /code/${filename} -o /code/a.out` : '';
    const runCmd = language === "cpp" ? `/code/a.out` : `python3 /code/${filename}`;

    const results = [];

    for (const testCase of problem.testCases) {
      const inputFile = path.join(__dirname, '../temp/input.txt');
      fs.writeFileSync(inputFile, testCase.input);

      const dockerCommand = `
        docker run --rm -v ${path.join(__dirname, '../temp')}:/code ${dockerImage} /bin/sh -c "
        ${compileCmd} && echo '${testCase.input}' | ${runCmd}
        "
      `;

      const output = await new Promise<string>((resolve, reject) => {
        exec(dockerCommand, (error, stdout, stderr) => {
          if (error) return reject(stderr);
          resolve(stdout.trim());
        });
      });

      const verdict = output === testCase.output.trim() ? "Accepted" : "Wrong Answer";
      results.push({ input: testCase.input, expected: testCase.output, got: output, verdict });
    }

    res.status(200).json({
      message: "Execution complete",
      results
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Execution failed", details: err });
  }
});

export default router;
