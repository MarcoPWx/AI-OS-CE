import React from "react";

export const StatusPills: React.FC = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        display: "flex",
        gap: 8,
        zIndex: 1001,
      }}
    >
      <span
        style={{
          background: "#2d6cdf",
          color: "#fff",
          padding: "2px 6px",
          borderRadius: 6,
          fontSize: 10,
        }}
      >
        AIBook
      </span>
      <span
        style={{
          background: "#4caf50",
          color: "#fff",
          padding: "2px 6px",
          borderRadius: 6,
          fontSize: 10,
        }}
      >
        MSW
      </span>
    </div>
  );
};
