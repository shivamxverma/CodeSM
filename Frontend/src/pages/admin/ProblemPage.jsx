import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useParams } from 'react-router-dom';

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [language] = useState("cpp");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [testCaseResults, setTestCaseResults] = useState([]);

  const boilerplateCode = [
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
  ];
  const { id: problemId } = useParams();

  useEffect(() => {
    // Fetch problem details
    axios.get(`http://localhost:8000/api/v1/problem/${problemId}`)
      .then(response => setProblem(response.data.message))
      .catch(() => setSubmissionResult({ status: "error", message: "Failed to load problem." }));
  }, [problemId]);

  useEffect(() => {
    // Load C++ boilerplate
    const template = boilerplateCode.find(item => item.language === language);
    setCode(template ? template.code : "");
  }, [language]);

  const handleEditorChange = (value) => setCode(value || "");

  const handleResetCode = () => {
    const template = boilerplateCode.find(item => item.language === language);
    setCode(template ? template.code : "");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    setTestCaseResults([]);
    try {
      const { data } = await axios.post(
        `http://localhost:8000/api/v1/submission/${problemId}`,
        { code, language },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const { execution, status } = data.message.output;
      setSubmissionResult({ status: "success", message: status || "Submitted successfully!" });
      setTestCaseResults(execution.map(tc => tc.isPassed));
    } catch (err) {
      setSubmissionResult({ status: "error", message: err.response?.data?.message || "Submission failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-2xl font-bold">{problem ? problem.title : "Loading..."}</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Problem Display Area */}
        <div className="w-1/2 p-6 bg-gray-800 overflow-y-auto">
          {problem ? (
            <>
              <h2 className="text-xl font-semibold mb-4">{problem.title}</h2>
              <p className="mb-4">{problem.description}</p>
              <div className="mb-4">
                <h4 className="font-medium mb-1">Difficulty</h4>
                <p>{problem.difficulty}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-medium mb-1">Constraints</h4>
                <p>{problem.constraints}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-medium mb-1">Input Format</h4>
                <pre className="bg-gray-700 p-3 rounded text-sm font-mono">{problem.inputFormat}</pre>
              </div>
              <div className="mb-4">
                <h4 className="font-medium mb-1">Output Format</h4>
                <pre className="bg-gray-700 p-3 rounded text-sm font-mono">{problem.outputFormat}</pre>
              </div>
              <div className="mb-4">
                <h4 className="font-medium mb-1">Sample Input</h4>
                <pre className="bg-gray-700 p-3 rounded text-sm font-mono">{problem.sampleInput}</pre>
              </div>
              <div className="mb-4">
                <h4 className="font-medium mb-1">Sample Output</h4>
                <pre className="bg-gray-700 p-3 rounded text-sm font-mono">{problem.sampleOutput}</pre>
              </div>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, idx) => (
                  <span key={idx} className="bg-blue-600 px-2 py-1 rounded text-sm">{tag}</span>
                ))}
              </div>
            </>
          ) : (
            <p>Loading problem details...</p>
          )}
        </div>

        {/* Code Editor Area */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
            <span>Language: C++</span>
            <button onClick={handleResetCode} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700">
              Reset Code
            </button>
          </div>
          <Editor
            height="100%"
            language="cpp"
            value={code}
            theme="vs-dark"
            onChange={handleEditorChange}
            options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
          />
        </div>
      </div>

      {/* Submission & Results */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-between items-center mb-4">
          {submissionResult && (
            <div className={`${submissionResult.status === 'success' ? 'bg-green-600' : 'bg-red-600'} px-4 py-2 rounded text-white`}>{submissionResult.message}</div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 rounded text-white flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            ) : 'Submit Code'}
          </button>
        </div>

        {testCaseResults.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Test Case Results</h4>
            <div className="flex flex-wrap gap-4">
              {testCaseResults.map((passed, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>Test Case {i + 1}:</span>
                  {passed ? (
                    <svg className="h-6 w-6 text-green-500" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPage;
