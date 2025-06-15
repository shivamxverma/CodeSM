import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const problemRoot = path.resolve(__dirname, '../');

const createProblemDirectory = async (problem) => {
    const { problemTitle, testcases } = problem;

    const problemDir = path.join(problemRoot, "problems");
    const problemName = problemTitle.replace(/\s+/g, '').toLowerCase();
    const problemPath = path.join(problemDir, problemName);

    // Create main folders if they don't exist
    if (!fs.existsSync(problemDir)) {
        fs.mkdirSync(problemDir, { recursive: true });
    }
    if (!fs.existsSync(problemPath)) {
        fs.mkdirSync(problemPath, { recursive: true });
    }

    const problemInputPath = path.join(problemPath, "input");
    const problemOutputPath = path.join(problemPath, "output");

    if (!fs.existsSync(problemInputPath)) {
        fs.mkdirSync(problemInputPath, { recursive: true });
    }
    if (!fs.existsSync(problemOutputPath)) {
        fs.mkdirSync(problemOutputPath, { recursive: true });
    }

    // Convert escaped newlines into actual newlines and write files
    const parsedTestcases = typeof testcases === 'string' ? JSON.parse(testcases) : testcases;

    for (let i = 0; i < parsedTestcases.length; i++) {
        const testcase = parsedTestcases[i];
        const input = testcase.input.replace(/\\n/g, '\n');
        const output = testcase.output.replace(/\\n/g, '\n');

        const inputFilePath = path.join(problemInputPath, `${i + 1}.txt`);
        const outputFilePath = path.join(problemOutputPath, `${i + 1}.txt`);

        fs.writeFileSync(inputFilePath, input, 'utf8');
        fs.writeFileSync(outputFilePath, output, 'utf8');
    }
};

export default createProblemDirectory;
