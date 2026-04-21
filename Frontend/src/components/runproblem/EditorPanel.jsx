import React from "react";
import Editor from "@monaco-editor/react";

export default function EditorPanel({
  language,
  monacoLanguage,
  code,
  handleEditorChange,
  onEditorMount
}) {
  return (
    <div className="flex-1 min-h-0 bg-[#0b0f13]">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={code}
        theme="vs-dark"
        onChange={handleEditorChange}
        onMount={onEditorMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          smoothScrolling: true,
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            alwaysConsumeMouseWheel: false,
          },
        }}
      />
    </div>
  );
}
