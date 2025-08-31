import React from "react";

export const HelpPanel: React.FC<{ link?: string }> = ({ link }) => {
  if (!link) return null;
  return (
    <a
      href={link}
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        background: "#111",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: 6,
        zIndex: 1001,
        textDecoration: "none",
        fontSize: 12,
      }}
    >
      Help
    </a>
  );
};
