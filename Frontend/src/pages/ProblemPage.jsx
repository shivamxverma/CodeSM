// src/components/CodeEditor.jsx
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
  const [code, setCode] = useState('// Write your code here');

  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left Panel – Question Description */}
      <div style={{ width: '50%', padding: '20px', backgroundColor: '#f0f0f0', overflowY: 'auto' }}>
        <h2>Question: Reverse a String</h2>
        <p>Write a function that takes a string as input and returns the string reversed.</p>
        <h4>Example:</h4>
        <pre>
          Input: "hello"
          Output: "olleh"
        </pre>
      </div>

      {/* Right Panel – Monaco Editor */}
      <div style={{ width: '50%', backgroundColor: '#1e1e1e', padding: '10px' }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue={code}
          theme="vs-dark"
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
}

export default ProblemPage;
