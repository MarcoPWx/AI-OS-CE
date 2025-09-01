import React, { useState, useEffect } from "react";

interface NetworkTest {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  status: "idle" | "running" | "success" | "failed";
  latency?: number;
  timestamp?: Date;
}

interface ConnectionStatus {
  service: string;
  status: "connected" | "connecting" | "disconnected";
  latency: number;
  packetLoss: number;
}

export default function NetworkPlayground(): JSX.Element {
  const [tests, setTests] = useState<NetworkTest[]>([
    {
      id: "1",
      name: "Health Check",
      endpoint: "/api/health",
      method: "GET",
      status: "idle",
    },
    {
      id: "2",
      name: "Database Ping",
      endpoint: "/api/db/ping",
      method: "GET",
      status: "idle",
    },
    {
      id: "3",
      name: "CDN Response",
      endpoint: "https://cdn.example.com/test",
      method: "HEAD",
      status: "idle",
    },
    {
      id: "4",
      name: "WebSocket Echo",
      endpoint: "wss://ws.example.com/echo",
      method: "WS",
      status: "idle",
    },
    {
      id: "5",
      name: "GraphQL Query",
      endpoint: "/graphql",
      method: "POST",
      status: "idle",
    },
  ]);

  const [connections] = useState<ConnectionStatus[]>([
    { service: "Primary API", status: "connected", latency: 23, packetLoss: 0 },
    {
      service: "Database Cluster",
      status: "connected",
      latency: 8,
      packetLoss: 0.1,
    },
    { service: "Redis Cache", status: "connected", latency: 2, packetLoss: 0 },
    { service: "CDN Edge", status: "connecting", latency: 45, packetLoss: 0.5 },
    {
      service: "Message Queue",
      status: "connected",
      latency: 15,
      packetLoss: 0,
    },
  ]);

  const [bandwidth, setBandwidth] = useState({ download: 875, upload: 245 });
  const [concurrentRequests, setConcurrentRequests] = useState(10);
  const [requestDelay, setRequestDelay] = useState(100);
  const [isLoadTesting, setIsLoadTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [networkStats, setNetworkStats] = useState({
    totalRequests: 0,
    successRate: 100,
    avgLatency: 0,
    p95Latency: 0,
    p99Latency: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setBandwidth((prev) => ({
        download: Math.max(0, prev.download + (Math.random() - 0.5) * 50),
        upload: Math.max(0, prev.upload + (Math.random() - 0.5) * 20),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const runTest = (testId: string) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId ? { ...test, status: "running" } : test,
      ),
    );

    setTimeout(
      () => {
        const latency = Math.floor(Math.random() * 200) + 10;
        const success = Math.random() > 0.1;

        setTests((prev) =>
          prev.map((test) =>
            test.id === testId
              ? {
                  ...test,
                  status: success ? "success" : "failed",
                  latency,
                  timestamp: new Date(),
                }
              : test,
          ),
        );

        setTestResults((prev) =>
          [
            ...prev,
            {
              testId,
              latency,
              success,
              timestamp: new Date(),
            },
          ].slice(-20),
        );
      },
      500 + Math.random() * 1000,
    );
  };

  const runLoadTest = () => {
    if (isLoadTesting) return;

    setIsLoadTesting(true);
    let completed = 0;
    const results: number[] = [];

    const interval = setInterval(() => {
      for (let i = 0; i < concurrentRequests; i++) {
        setTimeout(() => {
          const latency = Math.floor(Math.random() * 500) + 50;
          results.push(latency);
          completed++;

          if (completed >= 100) {
            clearInterval(interval);
            setIsLoadTesting(false);

            const sorted = results.sort((a, b) => a - b);
            setNetworkStats({
              totalRequests: completed,
              successRate: Math.floor(Math.random() * 5) + 95,
              avgLatency: Math.floor(
                results.reduce((a, b) => a + b, 0) / results.length,
              ),
              p95Latency: sorted[Math.floor(sorted.length * 0.95)],
              p99Latency: sorted[Math.floor(sorted.length * 0.99)],
            });
          }
        }, i * requestDelay);
      }
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "success":
        return "#10b981";
      case "connecting":
      case "running":
        return "#f59e0b";
      case "disconnected":
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return "#10b981";
    if (latency < 200) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: 24,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
            color: "#0f172a",
          }}
        >
          Network Playground
        </h1>
        <p style={{ color: "#64748b", fontSize: 16 }}>
          Monitor network connections, test endpoints, and simulate load
          conditions
        </p>
      </div>

      {/* Bandwidth Monitor */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 20,
            color: "#334155",
          }}
        >
          Bandwidth Monitor
        </h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, color: "#64748b" }}>Download</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                {bandwidth.download.toFixed(0)} Mbps
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: "#e2e8f0",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min((bandwidth.download / 1000) * 100, 100)}%`,
                  background: "#3b82f6",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, color: "#64748b" }}>Upload</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                {bandwidth.upload.toFixed(0)} Mbps
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: "#e2e8f0",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min((bandwidth.upload / 500) * 100, 100)}%`,
                  background: "#10b981",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Connection Status */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                color: "#334155",
              }}
            >
              Service Connections
            </h3>
          </div>
          <div style={{ padding: 20 }}>
            {connections.map((conn) => (
              <div
                key={conn.service}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: getStatusColor(conn.status),
                      animation:
                        conn.status === "connecting"
                          ? "pulse 2s infinite"
                          : "none",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#334155",
                      }}
                    >
                      {conn.service}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      {conn.latency}ms • {conn.packetLoss}% loss
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: getStatusColor(conn.status) + "20",
                    color: getStatusColor(conn.status),
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {conn.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint Tests */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                color: "#334155",
              }}
            >
              Endpoint Tests
            </h3>
          </div>
          <div style={{ padding: 20 }}>
            {tests.map((test) => (
              <div
                key={test.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}
                  >
                    {test.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    {test.method} {test.endpoint}
                  </div>
                  {test.latency && (
                    <div
                      style={{
                        fontSize: 11,
                        color: getLatencyColor(test.latency),
                        marginTop: 2,
                      }}
                    >
                      {test.latency}ms
                    </div>
                  )}
                </div>
                <button
                  onClick={() => runTest(test.id)}
                  disabled={test.status === "running"}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "none",
                    background:
                      test.status === "running" ? "#94a3b8" : "#3b82f6",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor:
                      test.status === "running" ? "not-allowed" : "pointer",
                  }}
                >
                  {test.status === "running" ? "Testing..." : "Test"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Load Testing */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 20,
            color: "#334155",
          }}
        >
          Load Testing
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 14,
                color: "#64748b",
                marginBottom: 8,
                display: "block",
              }}
            >
              Concurrent Requests
            </label>
            <input
              type="number"
              value={concurrentRequests}
              onChange={(e) => setConcurrentRequests(Number(e.target.value))}
              min="1"
              max="100"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                fontSize: 14,
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 14,
                color: "#64748b",
                marginBottom: 8,
                display: "block",
              }}
            >
              Request Delay (ms)
            </label>
            <input
              type="number"
              value={requestDelay}
              onChange={(e) => setRequestDelay(Number(e.target.value))}
              min="0"
              max="1000"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                fontSize: 14,
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={runLoadTest}
              disabled={isLoadTesting}
              style={{
                width: "100%",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: isLoadTesting ? "#94a3b8" : "#10b981",
                color: "white",
                fontSize: 14,
                fontWeight: 500,
                cursor: isLoadTesting ? "not-allowed" : "pointer",
              }}
            >
              {isLoadTesting ? "Running Load Test..." : "Start Load Test"}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {networkStats.totalRequests > 0 && (
          <div
            style={{
              padding: 20,
              background: "#f8fafc",
              borderRadius: 8,
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                Total Requests
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#334155" }}>
                {networkStats.totalRequests}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                Success Rate
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#10b981" }}>
                {networkStats.successRate}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                Avg Latency
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#334155" }}>
                {networkStats.avgLatency}ms
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                P95 Latency
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#f59e0b" }}>
                {networkStats.p95Latency}ms
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                P99 Latency
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#ef4444" }}>
                {networkStats.p99Latency}ms
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Test Results */}
      {testResults.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "#334155",
            }}
          >
            Recent Test Results
          </h3>
          <div
            style={{
              maxHeight: 200,
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: 12,
              background: "#f8fafc",
              padding: 12,
              borderRadius: 6,
            }}
          >
            {testResults
              .slice()
              .reverse()
              .map((result, idx) => (
                <div key={idx} style={{ marginBottom: 4 }}>
                  <span style={{ color: "#94a3b8" }}>
                    [{result.timestamp.toLocaleTimeString()}]
                  </span>{" "}
                  <span
                    style={{ color: result.success ? "#10b981" : "#ef4444" }}
                  >
                    {result.success ? "SUCCESS" : "FAILED"}
                  </span>{" "}
                  Test #{result.testId} - {result.latency}ms
                </div>
              ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
