const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const runCppCodeWithInput = async (cppCode, inputText) => {
  const codeDir = path.join(__dirname, "code");
  const codePath = path.join(codeDir, "user_code.cpp");
  const inputPath = path.join(codeDir, "input.txt");

  if (!fs.existsSync(codeDir)) fs.mkdirSync(codeDir);

  fs.writeFileSync(codePath, cppCode);
  fs.writeFileSync(inputPath, inputText);

  exec(`docker build -t cpp-runner .`, (err, stdout, stderr) => {
    if (err) {
      console.error("Docker build error:", stderr);
      return;
    }

    console.log("Image built successfully. Running code...\n");

    exec(`docker run --rm cpp-runner`, (err, stdout, stderr) => {
      if (err) {
        console.error("Code execution error:", stderr);
        return;
      }
      console.log("Output:\n" + stdout);
    });
  });
};

// const cppCode = `
// #include<iostream>
// using namespace std;

// int main() {
//     int n;cin>>n;
//     for(int i = 0; i < n; i++) {
//         int a,b;cin>>a>>b;
//         cout << "Sum is: " << (a + b) << endl;
//     }
//     return 0;
// }
// `;

// const inputText = `
// 5 
// 2 3
// 4 5
// 6 7
// 9 20
// 11 18
// `;

export {
  runCppCodeWithInput,
}

