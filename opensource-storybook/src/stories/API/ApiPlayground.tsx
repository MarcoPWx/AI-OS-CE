import React, { useState } from "react";

const ApiPlayground: React.FC = () => {
  const [result, setResult] = useState<string>("");

  async function ping() {
    try {
      const res = await fetch("/api/ping");
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult("Request failed");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h3>API Playground</h3>
      <button onClick={ping}>Ping /api/ping</button>
      <pre>{result}</pre>
    </div>
  );
};

export default ApiPlayground;
