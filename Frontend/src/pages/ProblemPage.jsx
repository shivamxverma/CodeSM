import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const ProblemPage = () => {
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript");

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const HandleSubmit = async () => {
    // console.log("Code submitted:", code);
    const response = await axios.post("http://localhost:8000/user/solveproblem", {
      code,
      language,
    });
    console.log("Response from server:", response.data);
  };

  return (
    <>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Left Panel – Question Description */}
        <div
          style={{
            width: "50%",
            padding: "20px",
            backgroundColor: "#f0f0f0",
            overflowY: "auto",
          }}
        >
          <h2>Question: Reverse a String</h2>
          <p>
            Write a function that takes a string as input and returns the string
            reversed.
          </p>
          <h4>Example:</h4>
          <pre>Input: "hello" Output: "olleh"</pre>
        </div>

        {/* Right Panel – Monaco Editor */}
        <div
          style={{ width: "50%", backgroundColor: "#1e1e1e", padding: "10px" }}
        >
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ marginBottom: "10px", padding: "5px" }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="typescript">TypeScript</option>
            <option value="kotlin">Kotlin</option>
          </select>
     
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue={code}
            theme="vs-dark"
            onChange={handleEditorChange}
          />
        </div>
      </div>
      <button
        style={{
          width: "100%",
          padding: "20px",
          backgroundColor: "GrayText",
          cursor: "pointer",
          margin: "10px",
        }}
        onClick={HandleSubmit}
      >
        Submit
      </button>
    </>
  );
};

export default ProblemPage;
