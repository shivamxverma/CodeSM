import React from "react";

export function Avatar({ className = "", children }) {
  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold ${className}`}
    >
      {children}
    </div>
  );
}

export function AvatarFallback({ children }) {
  return (
    <span className="text-gray-700">
      {children}
    </span>
  );
}
