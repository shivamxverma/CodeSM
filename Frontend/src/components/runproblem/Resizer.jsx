import React from "react";

/**
 * Resizer component for split panes.
 * Supports horizontal (side-by-side) and vertical (top-bottom) resizing.
 */
export default function Resizer({ direction = "horizontal", onMouseDown, onTouchStart }) {
  const isHorizontal = direction === "horizontal";
  
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`hidden xl:flex items-center justify-center shrink-0 bg-[#1b2330] hover:bg-[#2a4a73] transition-colors group z-10 
        ${isHorizontal ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize"}`}
      title={`Drag to resize ${isHorizontal ? "panels" : "editor / console"}`}
    >
      <div 
        className={`rounded-full bg-[#2a3750] group-hover:bg-[#4a7ab5] transition-colors
          ${isHorizontal ? "w-0.5 h-8" : "h-0.5 w-8"}`} 
      />
    </div>
  );
}
