// src/components/Spinner.jsx
import React from "react";
import "./spinner.css";

export const Spinner = ({ size = "3.25em", color = "hsl(214, 97%, 59%)" }) => {
  return (
    <svg
      viewBox="25 25 50 50"
      style={{
        width: size,
        height: size,
        transformOrigin: "center",
        animation: "rotate4 2s linear infinite",
      }}
    >
      <circle
        r="20"
        cy="50"
        cx="50"
        style={{
          fill: "none",
          stroke: color,
          strokeWidth: 2,
          strokeDasharray: "1, 200",
          strokeDashoffset: 0,
          strokeLinecap: "round",
          animation: "dash4 1.5s ease-in-out infinite",
        }}
      ></circle>
    </svg>
  );
};

