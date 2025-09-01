import React, { useState } from "react";

interface APIEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  requiresAuth: boolean;
  params?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
}

const mockEndpoints: APIEndpoint[] = [
  {
    id: "1",
    name: "Get User Profile",
    method: "GET",
    path: "/api/v1/users/{userId}",
    description: "Retrieve detailed user profile information",
    requiresAuth: true,
    params: [
      {
        name: "userId",
        type: "string",
        required: true,
        description: "Unique user identifier",
      },
      {
        name: "include",
        type: "string",
        required: false,
        description: "Include related data (posts, comments)",
      },
    ],
  },
  {
    id: "2",
    name: "Create Post",
    method: "POST",
    path: "/api/v1/posts",
    description: "Create a new blog post",
    requiresAuth: true,
    params: [
      {
        name: "title",
        type: "string",
        required: true,
        description: "Post title",
      },
      {
        name: "content",
        type: "string",
        required: true,
        description: "Post content in markdown",
      },
      {
        name: "tags",
        type: "array",
        required: false,
        description: "Array of tag strings",
      },
      {
        name: "published",
        type: "boolean",
        required: false,
        description: "Publish immediately",
      },
    ],
  },
  {
    id: "3",
    name: "Search Products",
    method: "GET",
    path: "/api/v1/products/search",
    description: "Search products with filters",
    requiresAuth: false,
    params: [
      {
        name: "q",
        type: "string",
        required: false,
        description: "Search query",
      },
      {
        name: "category",
        type: "string",
        required: false,
        description: "Product category",
      },
      {
        name: "minPrice",
        type: "number",
        required: false,
        description: "Minimum price",
      },
      {
        name: "maxPrice",
        type: "number",
        required: false,
        description: "Maximum price",
      },
      {
        name: "sort",
        type: "string",
        required: false,
        description: "Sort by: price, name, rating",
      },
    ],
  },
  {
    id: "4",
    name: "Update Settings",
    method: "PATCH",
    path: "/api/v1/settings",
    description: "Update user settings",
    requiresAuth: true,
    params: [
      {
        name: "theme",
        type: "string",
        required: false,
        description: "UI theme: light, dark, auto",
      },
      {
        name: "notifications",
        type: "object",
        required: false,
        description: "Notification preferences",
      },
      {
        name: "language",
        type: "string",
        required: false,
        description: "Preferred language",
      },
    ],
  },
  {
    id: "5",
    name: "Delete Session",
    method: "DELETE",
    path: "/api/v1/sessions/{sessionId}",
    description: "Terminate a user session",
    requiresAuth: true,
    params: [
      {
        name: "sessionId",
        type: "string",
        required: true,
        description: "Session identifier",
      },
    ],
  },
];

const mockResponses: Record<string, any> = {
  "1": {
    status: 200,
    data: {
      id: "12345",
      username: "johndoe",
      email: "john@example.com",
      profile: {
        firstName: "John",
        lastName: "Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        bio: "Full-stack developer passionate about React and TypeScript",
        joinedDate: "2023-01-15T08:00:00Z",
      },
      stats: {
        posts: 42,
        followers: 1337,
        following: 256,
      },
    },
  },
  "2": {
    status: 201,
    data: {
      id: "post-789",
      title: "Building Better APIs",
      slug: "building-better-apis",
      createdAt: new Date().toISOString(),
      status: "published",
      url: "/posts/building-better-apis",
    },
  },
  "3": {
    status: 200,
    data: {
      results: [
        {
          id: "prod-1",
          name: "Wireless Headphones",
          price: 99.99,
          rating: 4.5,
        },
        {
          id: "prod-2",
          name: "Mechanical Keyboard",
          price: 149.99,
          rating: 4.8,
        },
        { id: "prod-3", name: "USB-C Hub", price: 39.99, rating: 4.2 },
      ],
      total: 156,
      page: 1,
      perPage: 20,
    },
  },
  "4": {
    status: 200,
    data: {
      message: "Settings updated successfully",
      updated: ["theme", "notifications"],
    },
  },
  "5": {
    status: 204,
    data: null,
  },
};

const ApiPlayground: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint>(mockEndpoints[0]);
  const [params, setParams] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<Record<string, string>>({
    "Content-Type": "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  });
  const [requestBody, setRequestBody] = useState<string>("{}");
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body">("params");

  const getMethodColor = (method: string) => {
    const colors = {
      GET: "#10b981",
      POST: "#3b82f6",
      PUT: "#f59e0b",
      DELETE: "#ef4444",
      PATCH: "#8b5cf6",
    };
    return colors[method as keyof typeof colors] || "#6b7280";
  };

  const sendRequest = () => {
    setIsLoading(true);
    setResponse(null);

    // Simulate API call
    setTimeout(() => {
      const mockResponse = mockResponses[selectedEndpoint.id];
      setResponse({
        ...mockResponse,
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": Math.random().toString(36).substring(7),
          "X-Response-Time": Math.floor(Math.random() * 500) + "ms",
        },
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
    }, 800);
  };

  const buildUrl = () => {
    let url = selectedEndpoint.path;
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url = url.replace(`{${key}}`, value);
      }
    });
    return `https://api.example.com${url}`;
  };

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: 24,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
          API Playground
        </h1>
        <p style={{ color: "#64748b", fontSize: 16 }}>
          Test and explore API endpoints with an interactive request builder
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 24 }}>
        {/* Sidebar - Endpoints */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
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
              Available Endpoints
            </h3>
          </div>
          <div style={{ maxHeight: 600, overflowY: "auto" }}>
            {mockEndpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                onClick={() => {
                  setSelectedEndpoint(endpoint);
                  setParams({});
                  setResponse(null);
                }}
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer",
                  background: selectedEndpoint.id === endpoint.id ? "#f0f9ff" : "white",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedEndpoint.id !== endpoint.id) {
                    e.currentTarget.style.background = "#f8fafc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedEndpoint.id !== endpoint.id) {
                    e.currentTarget.style.background = "white";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: getMethodColor(endpoint.method),
                      background: getMethodColor(endpoint.method) + "20",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {endpoint.method}
                  </span>
                  {endpoint.requiresAuth && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "#f59e0b",
                        background: "#fef3c7",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      AUTH
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#0f172a",
                    marginBottom: 2,
                  }}
                >
                  {endpoint.name}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{endpoint.path}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Request Builder */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              marginBottom: 24,
            }}
          >
            {/* URL Bar */}
            <div
              style={{
                padding: 20,
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "white",
                    background: getMethodColor(selectedEndpoint.method),
                    padding: "8px 12px",
                    borderRadius: 6,
                    minWidth: 80,
                    textAlign: "center",
                  }}
                >
                  {selectedEndpoint.method}
                </span>
                <input
                  type="text"
                  value={buildUrl()}
                  readOnly
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                    fontSize: 14,
                    fontFamily: "monospace",
                    background: "#f8fafc",
                  }}
                />
                <button
                  onClick={sendRequest}
                  disabled={isLoading}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 6,
                    border: "none",
                    background: isLoading ? "#94a3b8" : "#3b82f6",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    minWidth: 100,
                  }}
                >
                  {isLoading ? "Sending..." : "Send Request"}
                </button>
              </div>
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  fontSize: 13,
                  color: "#64748b",
                }}
              >
                {selectedEndpoint.description}
              </p>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {(["params", "headers", "body"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    background: "none",
                    fontSize: 14,
                    fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? "#3b82f6" : "#64748b",
                    borderBottom: activeTab === tab ? "2px solid #3b82f6" : "none",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {tab}
                  {tab === "params" &&
                    selectedEndpoint.params &&
                    ` (${selectedEndpoint.params.length})`}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: 20 }}>
              {activeTab === "params" && (
                <div>
                  {selectedEndpoint.params && selectedEndpoint.params.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      {selectedEndpoint.params.map((param) => (
                        <div key={param.name}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 6,
                            }}
                          >
                            <label
                              style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#334155",
                              }}
                            >
                              {param.name}
                            </label>
                            {param.required && (
                              <span style={{ fontSize: 11, color: "#ef4444" }}>*required</span>
                            )}
                            <span
                              style={{
                                fontSize: 11,
                                color: "#64748b",
                                background: "#f1f5f9",
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              {param.type}
                            </span>
                          </div>
                          <input
                            type="text"
                            placeholder={param.description}
                            value={params[param.name] || ""}
                            onChange={(e) =>
                              setParams({
                                ...params,
                                [param.name]: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: 6,
                              border: "1px solid #e2e8f0",
                              fontSize: 14,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>
                      No parameters for this endpoint
                    </p>
                  )}
                </div>
              )}

              {activeTab === "headers" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {Object.entries(headers).map(([key, value]) => (
                      <div key={key} style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          value={key}
                          placeholder="Header name"
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                            fontSize: 14,
                            fontFamily: "monospace",
                          }}
                        />
                        <input
                          type="text"
                          value={value}
                          placeholder="Header value"
                          onChange={(e) => setHeaders({ ...headers, [key]: e.target.value })}
                          style={{
                            flex: 2,
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                            fontSize: 14,
                            fontFamily: "monospace",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "body" && (
                <div>
                  {selectedEndpoint.method !== "GET" && selectedEndpoint.method !== "DELETE" ? (
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      placeholder="Request body (JSON)"
                      style={{
                        width: "100%",
                        minHeight: 200,
                        padding: "12px",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        fontSize: 14,
                        fontFamily: "monospace",
                        resize: "vertical",
                      }}
                    />
                  ) : (
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>
                      {selectedEndpoint.method} requests typically don&apos;t have a request body
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Response */}
          {response && (
            <div
              style={{
                background: "white",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      margin: 0,
                      color: "#334155",
                    }}
                  >
                    Response
                  </h3>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: response.status < 300 ? "#10b981" : "#ef4444",
                      background: response.status < 300 ? "#d1fae5" : "#fee2e2",
                      padding: "4px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {response.status}{" "}
                    {response.status === 200
                      ? "OK"
                      : response.status === 201
                        ? "Created"
                        : response.status === 204
                          ? "No Content"
                          : "Error"}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  {response.headers["X-Response-Time"]}
                </span>
              </div>

              {/* Response Headers */}
              <div
                style={{
                  padding: 20,
                  borderBottom: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginTop: 0,
                    marginBottom: 12,
                    color: "#475569",
                  }}
                >
                  Headers
                </h4>
                <div style={{ fontSize: 13, fontFamily: "monospace" }}>
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: 4 }}>
                      <span style={{ color: "#64748b" }}>{key}:</span>{" "}
                      <span style={{ color: "#334155" }}>{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Body */}
              {response.data && (
                <div style={{ padding: 20 }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginTop: 0,
                      marginBottom: 12,
                      color: "#475569",
                    }}
                  >
                    Body
                  </h4>
                  <pre
                    style={{
                      margin: 0,
                      padding: 16,
                      background: "#f8fafc",
                      borderRadius: 6,
                      fontSize: 13,
                      fontFamily: "monospace",
                      color: "#334155",
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiPlayground;
