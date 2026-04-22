import React from "react";

export const Field = ({ label, hint, children }) => (
  <div>
    <div className="mb-1 flex items-center justify-between">
      <label className="text-sm font-medium text-slate-200">{label}</label>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
);

export const CharCount = ({ value, max = 5000 }) => (
  <span
    className={`text-xs ${
      value.length > max ? "text-rose-300" : "text-slate-400"
    }`}
  >
    {value.length}/{max}
  </span>
);
