import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useParams } from 'react-router-dom';


const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [boilerplateCode] = useState([
    {
      language: "javascript",
      code: `function Solution(str) {\n  return str.split("").reverse().join("");\n}`,
    },
    {
      language: "cpp",
      code: `#include <string>\n#include <iostream>\nusing namespace std;\n\nstring Solve(string s) {\n  string result = "";\n  for (int i = s.size() - 1; i >= 0; i--) {\n    result += s[i];\n  }\n  return result;\n}`,
    },
    {
      language: "python",
      code: `def solution(str):\n    return str[::-1]`,
    },
    {
      language: "java",
      code: `class Solution {\n    public String solve(String s) {\n        StringBuilder sb = new StringBuilder();\n        for (int i = s.length() - 1; i >= 0; i--) {\n            sb.append(s.charAt(i));\n        }\n        return sb.toString();\n    }\n}`,
    },
  ]);
  const { id } = useParams();
    const problemId = id;

  useEffect(() => {
    

    const fetchProblem = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/problem/${problemId}`);
        console.log(response.data.message);
        setProblem(response.data.message);
      } catch (error) {
        setSubmissionResult({ status: "error", message: "Failed to load problem." });
      }
    };
    fetchProblem();
  }, []);

  useEffect(() => {
    const selectedBoilerplate = boilerplateCode.find((item) => item.language === language);
    setCode(selectedBoilerplate ? selectedBoilerplate.code : "// Boilerplate code not found");
  }, [language, boilerplateCode]);

  const handleEditorChange = (value) => setCode(value);

  const handleResetCode = () => {
    const selectedBoilerplate = boilerplateCode.find((item) => item.language === language);
    setCode(selectedBoilerplate ? selectedBoilerplate.code : "// Boilerplate code not found");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const response = await axios.post(`http://localhost:8000/api/v1/submission/submit`, {
        code,
        language,
        problemId,    
      });
      setSubmissionResult({
        status: "success",
        message: response.data.message || "Code submitted successfully!",
      });
    } catch (error) {
      setSubmissionResult({
        status: "error",
        message: error.response?.data?.message || "Failed to submit code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen text-gray-200 font-sans bg-gray-900">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-2xl font-bold text-white">{problem ? problem.title : "Loading..."}</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 p-6 bg-gray-800 overflow-y-auto">
          {problem ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-4">{problem.title}</h2>
              <p className="text-base text-gray-300 mb-4">{problem.description}</p>
              <h4 className="text-lg font-medium text-white mb-2">Difficulty</h4>
              <p className="text-gray-300 mb-4">
                {problem.difficulty}
              </p>
              <h4 className="text-lg font-medium text-white mb-2">Constraints</h4>
              <p className="text-gray-300 mb-4">{problem.constraints}</p>
              <h4 className="text-lg font-medium text-white mb-2">Input Format</h4>
              <pre className="bg-gray-700 p-4 rounded-lg text-sm font-mono text-gray-200 mb-4">
                {problem.inputFormat}
              </pre>
              <h4 className="text-lg font-medium text-white mb-2">Output Format</h4>
              <pre className="bg-gray-700 p-4 rounded-lg text-sm font-mono text-gray-200 mb-4">
                {problem.outputFormat}
              </pre>
              <h4 className="text-lg font-medium text-white mb-2">Sample Input</h4>
              <pre className="bg-gray-700 p-4 rounded-lg text-sm font-mono text-gray-200 mb-4">
                {problem.sampleInput}
              </pre>
              <h4 className="text-lg font-medium text-white mb-2">Sample Output</h4>
              <pre className="bg-gray-700 p-4 rounded-lg text-sm font-mono text-gray-200 mb-4">
                {problem.sampleOutput}
              </pre>
              <h4 className="text-lg font-medium text-white mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {problem.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              {/* <h4 className="text-lg font-medium text-white mb-2">Test Cases</h4>
              <a
                href={problem.testcases}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Download test cases (.txt)
              </a> */}
            </>
          ) : (
            <p className="text-gray-400">Loading problem details...</p>
          )}
        </div>
        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="p-2 bg-gray-800 flex justify-between items-center border-b border-gray-700">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <button
              onClick={handleResetCode}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Reset Code
            </button>
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
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
        {submissionResult && (
          <div
            className={`text-sm px-4 py-2 rounded-md ${
              submissionResult.status === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {submissionResult.message}
          </div>
        )}
        <button
          className={`px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 flex items-center gap-2 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {isSubmitting ? "Submitting..." : "Submit Code"}
        </button>
      </div>
    </div>
  );
};

export default ProblemPage;