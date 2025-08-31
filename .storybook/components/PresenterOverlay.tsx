import React from "react";

export const PresenterOverlay: React.FC<{
  visible: boolean;
  onClose: () => void;
  mswStatus?: string;
  script?: string;
}> = ({ visible, onClose, mswStatus, script }) => {
  if (!visible) return null;
  return (
    <div
      role="dialog"
      aria-label="Presenter Overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        color: "#fff",
        zIndex: 1002,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <strong>Presenter</strong>
        <button
          onClick={onClose}
          style={{
            background: "#fff",
            border: 0,
            borderRadius: 4,
            padding: "4px 8px",
          }}
        >
          Close
        </button>
      </div>
      <div style={{ padding: 16 }}>
        <div>MSW: {mswStatus || "unknown"}</div>
        {script ? (
          <pre style={{ whiteSpace: "pre-wrap" }}>{script}</pre>
        ) : (
          <p>Press "g" twice to toggle this overlay.</p>
        )}
      </div>
    </div>
  );
};
