import React, { useState, useEffect } from "react";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
}

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: number;
  responseTime: number;
  lastChecked: Date;
}

interface Alert {
  id: string;
  severity: "info" | "warning" | "error";
  message: string;
  timestamp: Date;
  service: string;
}

const StatusDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: "CPU Usage",
      value: 42,
      unit: "%",
      status: "healthy",
      trend: "stable",
    },
    { name: "Memory", value: 67, unit: "%", status: "warning", trend: "up" },
    {
      name: "Disk I/O",
      value: 23,
      unit: "MB/s",
      status: "healthy",
      trend: "down",
    },
    {
      name: "Network",
      value: 156,
      unit: "Mbps",
      status: "healthy",
      trend: "up",
    },
    {
      name: "API Latency",
      value: 124,
      unit: "ms",
      status: "healthy",
      trend: "stable",
    },
    {
      name: "Error Rate",
      value: 0.3,
      unit: "%",
      status: "healthy",
      trend: "down",
    },
  ]);

  const [services] = useState<ServiceStatus[]>([
    {
      name: "API Gateway",
      status: "operational",
      uptime: 99.99,
      responseTime: 45,
      lastChecked: new Date(),
    },
    {
      name: "Database",
      status: "operational",
      uptime: 99.95,
      responseTime: 12,
      lastChecked: new Date(),
    },
    {
      name: "Cache Service",
      status: "degraded",
      uptime: 98.5,
      responseTime: 89,
      lastChecked: new Date(),
    },
    {
      name: "Auth Service",
      status: "operational",
      uptime: 99.98,
      responseTime: 23,
      lastChecked: new Date(),
    },
    {
      name: "File Storage",
      status: "operational",
      uptime: 99.97,
      responseTime: 67,
      lastChecked: new Date(),
    },
    {
      name: "Queue Service",
      status: "operational",
      uptime: 99.92,
      responseTime: 15,
      lastChecked: new Date(),
    },
  ]);

  const [alerts] = useState<Alert[]>([
    {
      id: "1",
      severity: "warning",
      message: "Cache service experiencing elevated response times",
      timestamp: new Date(Date.now() - 300000),
      service: "Cache Service",
    },
    {
      id: "2",
      severity: "info",
      message: "Scheduled maintenance window in 2 hours",
      timestamp: new Date(Date.now() - 900000),
      service: "System",
    },
    {
      id: "3",
      severity: "error",
      message: "Failed login attempts exceeded threshold",
      timestamp: new Date(Date.now() - 1800000),
      service: "Auth Service",
    },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate metric updates
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * 2,
        })),
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return "#10b981";
      case "warning":
      case "degraded":
        return "#f59e0b";
      case "critical":
      case "down":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "info":
        return "#3b82f6";
      case "warning":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatTimestamp = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const overallHealth =
    (services.filter((s) => s.status === "operational").length /
      services.length) *
    100;

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: 24,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                marginBottom: 8,
                color: "#0f172a",
              }}
            >
              System Status Dashboard
            </h1>
            <p style={{ color: "#64748b", fontSize: 16 }}>
              Real-time monitoring and health metrics
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, color: "#64748b" }}>Last updated</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#334155" }}>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Health */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 8,
                color: "#334155",
              }}
            >
              System Health
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background:
                    overallHealth > 90
                      ? "#10b981"
                      : overallHealth > 70
                        ? "#f59e0b"
                        : "#ef4444",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
                {overallHealth.toFixed(1)}% Operational
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                Services
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#334155" }}>
                {services.filter((s) => s.status === "operational").length}/
                {services.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                Avg Uptime
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#334155" }}>
                {(
                  services.reduce((acc, s) => acc + s.uptime, 0) /
                  services.length
                ).toFixed(2)}
                %
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                Active Alerts
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: alerts.length > 0 ? "#f59e0b" : "#10b981",
                }}
              >
                {alerts.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.name}
            style={{
              background: "white",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              borderLeft: `4px solid ${getStatusColor(metric.status)}`,
            }}
          >
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
              {metric.name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>
                {metric.value.toFixed(metric.unit === "%" ? 0 : 1)}
              </span>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>
                {metric.unit}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 14 }}>
                {metric.trend === "up"
                  ? "↑"
                  : metric.trend === "down"
                    ? "↓"
                    : "→"}
              </span>
            </div>
            <div
              style={{
                height: 4,
                background: "#e2e8f0",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(metric.value, 100)}%`,
                  background: getStatusColor(metric.status),
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Services Status */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
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
              Service Status
            </h3>
          </div>
          <div style={{ padding: 20 }}>
            {services.map((service) => (
              <div
                key={service.name}
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
                      background: getStatusColor(service.status),
                      display: "inline-block",
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
                      {service.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      {service.responseTime}ms response
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: getStatusColor(service.status) + "20",
                      color: getStatusColor(service.status),
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {service.status}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {service.uptime}% uptime
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
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
              Recent Alerts
            </h3>
          </div>
          <div style={{ padding: 20 }}>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: 12,
                    marginBottom: 12,
                    borderRadius: 8,
                    background: getSeverityColor(alert.severity) + "10",
                    borderLeft: `3px solid ${getSeverityColor(alert.severity)}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: getSeverityColor(alert.severity),
                        textTransform: "uppercase",
                      }}
                    >
                      {alert.severity}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#334155", marginBottom: 2 }}
                  >
                    {alert.message}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {alert.service}
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: 14,
                  textAlign: "center",
                  padding: 20,
                }}
              >
                No active alerts
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div
        style={{
          marginTop: 24,
          background: "white",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
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
          Live Activity Feed
        </h3>
        <div
          style={{
            height: 200,
            background: "#0f172a",
            borderRadius: 8,
            padding: 16,
            fontFamily: "monospace",
            fontSize: 12,
            color: "#10b981",
            overflowY: "auto",
          }}
        >
          <div>
            [{currentTime.toLocaleTimeString()}] API Gateway: Request processed
            (45ms)
          </div>
          <div>
            [{new Date(currentTime.getTime() - 1000).toLocaleTimeString()}]
            Database: Query executed (12ms)
          </div>
          <div>
            [{new Date(currentTime.getTime() - 2000).toLocaleTimeString()}]
            Cache Service: Cache hit ratio 89%
          </div>
          <div>
            [{new Date(currentTime.getTime() - 3000).toLocaleTimeString()}] Auth
            Service: User authenticated
          </div>
          <div>
            [{new Date(currentTime.getTime() - 4000).toLocaleTimeString()}] File
            Storage: File uploaded (2.3MB)
          </div>
          <div>
            [{new Date(currentTime.getTime() - 5000).toLocaleTimeString()}]
            Queue Service: Message processed
          </div>
          <div>
            [{new Date(currentTime.getTime() - 6000).toLocaleTimeString()}] API
            Gateway: Rate limit check passed
          </div>
          <div>
            [{new Date(currentTime.getTime() - 7000).toLocaleTimeString()}]
            Database: Connection pool healthy
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDashboard;
