import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const ProblemPage = () => {
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript");

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting code:", code);
      const response = await axios.post("http://localhost:8000/user/solveproblem", {
        code,
        language,
      });
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error submitting code:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <h1 className="text-2xl font-semibold">Code Challenge Platform</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel – Question Description */}
        <div className="w-1/2 p-6 bg-white overflow-y-auto border-r border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Reverse a String</h2>
          <p className="text-base text-gray-600 leading-relaxed mb-4">
            Write a function that takes a string as input and returns the string reversed.
          </p>
          <h4 className="text-lg font-medium text-gray-800 mb-2">Example:</h4>
          <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800">
            {`Input: "hello"\nOutput: "olleh"`}
          </pre>
        </div>

        {/* Right Panel – Monaco Editor */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="p-2 bg-gray-800 border-b border-gray-700">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>
          <Editor
            height="100%"
            defaultLanguage={language}
            value={code}
            theme="vs-dark"
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {/* Footer with Submit Button */}
      <div className="p-4 bg-white border-t border-gray-200 flex justify-end">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          onClick={handleSubmit}
        >
          Submit Code
        </button>
      </div>
    </div>
  );
};

export default ProblemPage;