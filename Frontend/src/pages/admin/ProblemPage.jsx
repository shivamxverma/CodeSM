import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const ProblemPage = () => {
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [boilerplateCode, setBoilerplateCode] = useState([
    {
      language: "javascript",
      code: `function Solution(str) {
  // Your code here
  for (let i = str.length - 1; i >= 0; i--) {
    console.log(str[i]);
  }
  return str.split("").reverse().join("");
}`,
    },
    {
      language: "cpp",
      code: `#include <string>
#include <iostream>
using namespace std;

string Solve(string s) {
  string result = "";
  for (int i = s.size() - 1; i >= 0; i--) {
    result += s[i];
  }
  return result;
}`,
    },
    {
      language: "python",
      code: `def solution(str):
    # Your code here
    return str[::-1]`,
    },
    {
      language: "java",
      code: `class Solution {
    public String solve(String s) {
        // Your code here
        StringBuilder sb = new StringBuilder();
        for (int i = s.length() - 1; i >= 0; i--) {
            sb.append(s.charAt(i));
        }
        return sb.toString();
    }
}`,
    },
  ]);

  useEffect(() => {
    const selectedBoilerplate = boilerplateCode.find(
      (item) => item.language === language
    );
    if (selectedBoilerplate) {
      setCode(selectedBoilerplate.code);
    } else {
      setCode("// Boilerplate code not found for this language");
    }
  }, [language, boilerplateCode]);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      console.log("Submitting code:", code);
      const response = await axios.post("http://localhost:8000/user/solveproblem", {
        code,
        language,
      });
      console.log("Response from server:", response.data);
      setSubmissionResult({ status: "success", message: response.data.message || "Code submitted successfully!" });
    } catch (error) {
      console.error("Error submitting code:", error);
      setSubmissionResult({
        status: "error",
        message: error.response?.data?.message || "Failed to submit code. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
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
            </select>
          </div>
          <Editor
            height="100%"
            language={language}
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

      {/* Footer with Submit Button and Feedback */}
      <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center">
        {submissionResult && (
          <div
            className={`text-sm ${
              submissionResult.status === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {submissionResult.message}
          </div>
        )}
        <button
          className={`px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Code"}
        </button>
      </div>
    </div>
  );
};

export default ProblemPage;