import React from "react";
import { MOCK_ROUTES } from "../../src/mocks/handlers";

export const MswInfoOverlay: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div
      role="dialog"
      aria-label="MSW Info Overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        color: "#fff",
        zIndex: 1003,
      }}
    >
      <div style={{ background: "#111", margin: 24, padding: 16, borderRadius: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>MSW Info</h3>
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
        <table
          style={{
            width: "100%",
            marginTop: 12,
            background: "#222",
            color: "#fff",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th align="left" style={{ padding: 6 }}>
                Method
              </th>
              <th align="left" style={{ padding: 6 }}>
                Path
              </th>
              <th align="left" style={{ padding: 6 }}>
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ROUTES.map((r) => (
              <tr key={r.method + r.path}>
                <td style={{ padding: 6 }}>{r.method}</td>
                <td style={{ padding: 6 }}>{r.path}</td>
                <td style={{ padding: 6 }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
