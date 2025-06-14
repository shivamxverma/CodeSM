import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../../'); 

const runCppCodeWithInput = async (cppCode, inputText) => {
  const codeDir = path.join(projectRoot, 'code');
  const codePath = path.join(codeDir, 'user_code.cpp');
  const inputPath = path.join(codeDir, 'input.txt');

  try {
    // Ensure the code directory exists
    if (!fs.existsSync(codeDir)) {
      fs.mkdirSync(codeDir, { recursive: true });
    }

    console.log('Writing C++ code and input files...');
    // Write the C++ code and input text to files
    fs.writeFileSync(codePath, cppCode);
    fs.writeFileSync(inputPath, inputText);

    // Verify that the files were created
    if (!fs.existsSync(codePath) || !fs.existsSync(inputPath)) {
      throw new Error('Failed to create user_code.cpp or input.txt');
    }

    console.log('Building Docker image...');
    // Build the Docker image
    const { stdout: buildStdout, stderr: buildStderr } = await execPromise(
      `docker build -t cpp-runner .`,
      { cwd: projectRoot }
    );

    if (buildStderr) {
      console.error('Docker build error:', buildStderr);
      throw new Error(`Docker build failed: ${buildStderr}`);
    }
    console.log('Docker image built successfully:\n', buildStdout);

    console.log('Running Docker container...');
    // Run the Docker container
    const { stdout: runStdout, stderr: runStderr } = await execPromise(`docker run --rm cpp-runner`);

    if (runStderr) {
      console.error('Code execution error:', runStderr);
      throw new Error(`Code execution failed: ${runStderr}`);
    }

    console.log('Code executed successfully. Output:\n', runStdout);
    return runStdout; // Return the correct variable
  } catch (err) {
    console.error('Error:', err.message);
    throw err; // Re-throw the error to allow the caller to handle it
  } finally {
    // Optional: Clean up files to avoid clutter
    if (fs.existsSync(codePath)) fs.unlinkSync(codePath);
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
  }
};

export { runCppCodeWithInput };