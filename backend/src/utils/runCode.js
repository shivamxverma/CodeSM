import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

// Promisify exec
const execPromise = promisify(exec);

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the project root directory (adjust this path as needed)
const projectRoot = path.resolve(__dirname, '../../'); // Adjust to point to /backend/

const runCppCodeWithInput = async (cppCode, inputText) => {
  const codeDir = path.join(projectRoot, 'code');
  const codePath = path.join(codeDir, 'user_code.cpp');
  const inputPath = path.join(codeDir, 'input.txt');

  // Ensure the code directory exists
  if (!fs.existsSync(codeDir)) {
    fs.mkdirSync(codeDir, { recursive: true });
  }

  // Write files synchronously
  fs.writeFileSync(codePath, cppCode);
  fs.writeFileSync(inputPath, inputText);

  // Verify files exist
  if (!fs.existsSync(codePath) || !fs.existsSync(inputPath)) {
    console.error('Error: Failed to create user_code.cpp or input.txt');
    return;
  }

  try {
    // Run docker build in the project root
    const { stdout: buildStdout, stderr: buildStderr } = await execPromise(
      `docker build -t cpp-runner .`,
      { cwd: projectRoot }
    );
    if (buildStderr) {
      console.error('Docker build error:', buildStderr);
      return;
    }
    console.log('Image built successfully. Running code...\n', buildStdout);

    // Run the container
    const { stdout: runStdout, stderr: runStderr } = await execPromise(`docker run --rm cpp-runner`);
    if (runStderr) {
      console.error('Code execution error:', runStderr);
      return;
    }
    console.log('Output:\n', runStdout);
  } catch (err) {
    console.error('Error:', err.message);
  }
};

export { runCppCodeWithInput };