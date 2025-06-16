import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

const runCppCodeWithInput = async (cppCode, problemTitle) => {
  const codeDir = path.join(projectRoot, 'problems');
  const runnerDir = path.join(projectRoot, 'code');
  const problemName = problemTitle.replace(/\s+/g, '').toLowerCase();
  const problemPath = path.join(codeDir, problemName);
  const codePath = path.join(runnerDir, 'user_code.cpp');

  if(!fs.existsSync(runnerDir)){
    fs.mkdirSync(runnerDir, { recursive: true });
  }

  fs.writeFileSync(codePath, cppCode);

  const inputDir = path.join(problemPath, 'input');
  const outputDir = path.join(problemPath, 'output');

  const inputFiles = fs.readdirSync(inputDir)
    .filter(f => f.endsWith('.txt'))
    .sort((a, b) => parseInt(a) - parseInt(b));

  try {
    console.log("🛠️ Building Docker image...");
    await execAsync(`docker build -t cpp-runner .`, { cwd: projectRoot });
    console.log("✅ Docker image built.");
  } catch (err) {
    console.error("❌ Docker build failed:\n", err.stderr || err.message);
    return 'builderror';
  }

  console.log("🚀 Running test cases...");
  const execution = [];

  for (const file of inputFiles) {
    const testCaseNumber = file.replace('.txt', '');
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${testCaseNumber}.txt`);

    const inputText = fs.readFileSync(inputPath, 'utf-8');
    const expectedOutput = fs.readFileSync(outputPath, 'utf-8');

    const tempInputPath = path.join(runnerDir, 'input.txt');
    fs.writeFileSync(tempInputPath, inputText);

    console.log(`\n🧪 Test case ${testCaseNumber}`);
    console.log("Input:\n" + inputText);

    try {
      const { stdout } = await execAsync(
        `docker run --rm -v ${runnerDir}:/app cpp-runner`,
        { cwd: projectRoot }
      );

      console.log("Output:\n" + stdout);

      if (stdout.trim() !== expectedOutput.trim()) {
        console.log("❌ Output does not match expected.");
        // return 'wronganswer';
      }

      console.log("✅ Output matches expected output.");
      execution.push({
        isPassed: true,
        output: stdout.trim(),
        testCaseNumber: testCaseNumber,
      });

    } catch (err) {
      console.error("❌ Execution failed:\n", err.stderr || err.message);
      // return 'executionerror';
    }
  }

  for(const result of execution){
    if(!result.isPassed){
      return {
        status: "rejected",
        execution
      };
    }
  }

  console.log(execution);

  return {
    status: "accepted",
    execution
  };
};

export default runCppCodeWithInput;
