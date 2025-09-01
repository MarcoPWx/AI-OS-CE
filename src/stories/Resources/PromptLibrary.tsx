import React, { useState } from "react";

interface PromptTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  template: string;
  variables?: string[];
  example?: string;
  tags: string[];
}

const promptTemplates: PromptTemplate[] = [
  // Component Development
  {
    id: "1",
    category: "Component Development",
    title: "Create React Component",
    description: "Generate a complete React component with TypeScript",
    template: `Create a React component called {ComponentName} with TypeScript that:
- {MainFunctionality}
- Has props: {PropsList}
- Includes proper TypeScript types
- Follows React best practices
- Includes error boundaries if needed
- Has loading and error states
- Is fully accessible (ARIA labels, keyboard navigation)`,
    variables: ["ComponentName", "MainFunctionality", "PropsList"],
    example:
      "Create a React component called UserCard that displays user information with props: user (name, email, avatar), onEdit, onDelete",
    tags: ["react", "typescript", "component"],
  },
  {
    id: "2",
    category: "Component Development",
    title: "Add Storybook Story",
    description: "Create Storybook stories for existing component",
    template: `Create a Storybook story for the {ComponentName} component:
- Include all prop variations
- Add controls for interactive props
- Create multiple story variants (Default, Loading, Error, etc.)
- Add proper documentation
- Include args and argTypes
- Follow CSF3 format`,
    variables: ["ComponentName"],
    tags: ["storybook", "testing", "documentation"],
  },

  // Testing
  {
    id: "3",
    category: "Testing",
    title: "Write Unit Tests",
    description: "Generate comprehensive unit tests",
    template: `Write unit tests for {ComponentOrFunction} using {TestFramework}:
- Test all happy paths
- Test error cases and edge cases
- Test async operations if present
- Include setup and teardown
- Mock external dependencies
- Aim for {CoverageTarget}% coverage
- Add descriptive test names`,
    variables: ["ComponentOrFunction", "TestFramework", "CoverageTarget"],
    example: "Write unit tests for UserService using Vitest with 90% coverage",
    tags: ["testing", "unit-tests", "coverage"],
  },
  {
    id: "4",
    category: "Testing",
    title: "E2E Test Scenario",
    description: "Create end-to-end test scenarios",
    template: `Write E2E tests for the {UserFlow} flow using {Framework}:
- Start from {StartPoint}
- Test user interactions: {Interactions}
- Verify expected outcomes
- Test error scenarios
- Include accessibility checks
- Add data cleanup`,
    variables: ["UserFlow", "Framework", "StartPoint", "Interactions"],
    tags: ["e2e", "playwright", "integration"],
  },

  // API Development
  {
    id: "5",
    category: "API Development",
    title: "REST API Endpoint",
    description: "Design and implement REST API endpoint",
    template: `Create a {Method} endpoint at {Path} that:
- Accepts: {InputData}
- Returns: {ResponseFormat}
- Includes validation for: {ValidationRules}
- Has error handling for: {ErrorCases}
- Implements {AuthType} authentication
- Includes rate limiting
- Returns proper HTTP status codes`,
    variables: [
      "Method",
      "Path",
      "InputData",
      "ResponseFormat",
      "ValidationRules",
      "ErrorCases",
      "AuthType",
    ],
    tags: ["api", "rest", "backend"],
  },
  {
    id: "6",
    category: "API Development",
    title: "GraphQL Schema",
    description: "Define GraphQL schema and resolvers",
    template: `Create GraphQL schema for {EntityName}:
- Define types with fields: {Fields}
- Create queries: {Queries}
- Create mutations: {Mutations}
- Add input types for mutations
- Include field-level authorization
- Add data loader for N+1 prevention
- Write resolvers with error handling`,
    variables: ["EntityName", "Fields", "Queries", "Mutations"],
    tags: ["graphql", "api", "schema"],
  },

  // Debugging
  {
    id: "7",
    category: "Debugging",
    title: "Debug React Issue",
    description: "Systematic debugging approach for React",
    template: `Help debug this React issue:
Component: {ComponentName}
Error message: {ErrorMessage}
Expected behavior: {ExpectedBehavior}
Actual behavior: {ActualBehavior}
Code snippet: {CodeSnippet}

Please:
1. Identify the root cause
2. Explain why it's happening
3. Provide the fixed code
4. Suggest how to prevent this in the future`,
    variables: [
      "ComponentName",
      "ErrorMessage",
      "ExpectedBehavior",
      "ActualBehavior",
      "CodeSnippet",
    ],
    tags: ["debugging", "react", "troubleshooting"],
  },
  {
    id: "8",
    category: "Debugging",
    title: "Performance Analysis",
    description: "Identify and fix performance issues",
    template: `Analyze performance issues in {ComponentOrPage}:
Current metrics: {CurrentMetrics}
Target metrics: {TargetMetrics}
User complaints: {Issues}

Please:
1. Identify performance bottlenecks
2. Suggest optimization strategies
3. Provide code improvements
4. Recommend monitoring approach`,
    variables: ["ComponentOrPage", "CurrentMetrics", "TargetMetrics", "Issues"],
    tags: ["performance", "optimization", "debugging"],
  },

  // Code Review
  {
    id: "9",
    category: "Code Review",
    title: "Security Review",
    description: "Security-focused code review",
    template: `Review this code for security vulnerabilities:
{CodeToReview}

Check for:
- XSS vulnerabilities
- SQL injection risks
- Authentication/authorization issues
- Sensitive data exposure
- CORS misconfigurations
- Dependency vulnerabilities

Rate severity and provide fixes`,
    variables: ["CodeToReview"],
    tags: ["security", "review", "vulnerabilities"],
  },
  {
    id: "10",
    category: "Code Review",
    title: "Accessibility Audit",
    description: "Review code for accessibility compliance",
    template: `Review {ComponentName} for accessibility:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- ARIA labels and roles
- Color contrast ratios
- Focus management
- Error messaging

Provide specific improvements with code examples`,
    variables: ["ComponentName"],
    tags: ["accessibility", "a11y", "review"],
  },

  // Architecture
  {
    id: "11",
    category: "Architecture",
    title: "System Design",
    description: "Design system architecture",
    template: `Design architecture for {SystemDescription}:
Requirements:
- Scale: {ScaleRequirements}
- Performance: {PerformanceRequirements}
- Budget: {BudgetConstraints}

Provide:
1. High-level architecture diagram description
2. Technology stack recommendations
3. Database design
4. API design
5. Scaling strategy
6. Security considerations
7. Monitoring approach`,
    variables: [
      "SystemDescription",
      "ScaleRequirements",
      "PerformanceRequirements",
      "BudgetConstraints",
    ],
    tags: ["architecture", "system-design", "planning"],
  },
  {
    id: "12",
    category: "Architecture",
    title: "Refactoring Plan",
    description: "Plan for refactoring legacy code",
    template: `Create refactoring plan for {LegacySystem}:
Current issues: {CurrentIssues}
Goals: {RefactoringGoals}
Constraints: {Constraints}

Provide:
1. Refactoring strategy (phases)
2. Risk assessment
3. Testing approach
4. Migration plan
5. Rollback procedures
6. Success metrics`,
    variables: ["LegacySystem", "CurrentIssues", "RefactoringGoals", "Constraints"],
    tags: ["refactoring", "architecture", "migration"],
  },
];

const PromptLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(promptTemplates.map((p) => p.category)))];

  const filteredPrompts = promptTemplates.filter((prompt) => {
    const matchesCategory = selectedCategory === "All" || prompt.category === selectedCategory;
    const matchesSearch =
      searchTerm === "" ||
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "Component Development": "🧩",
      Testing: "🧪",
      "API Development": "🌐",
      Debugging: "🐛",
      "Code Review": "👀",
      Architecture: "🏗️",
    };
    return icons[category] || "📝";
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
          📚 AI Prompt Library
        </h1>
        <p style={{ color: "#64748b", fontSize: 16 }}>
          Battle-tested prompts for common development tasks
        </p>
      </div>

      {/* Search and Filters */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: 300,
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 14,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: selectedCategory === category ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                  background: selectedCategory === category ? "#eff6ff" : "white",
                  color: selectedCategory === category ? "#3b82f6" : "#64748b",
                  fontSize: 13,
                  fontWeight: selectedCategory === category ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prompt Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: 20,
        }}
      >
        {filteredPrompts.map((prompt) => (
          <div
            key={prompt.id}
            style={{
              background: "white",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}
            onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1)";
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{getCategoryIcon(prompt.category)}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {prompt.category}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(prompt.template, prompt.id);
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "1px solid #e2e8f0",
                    background: copiedId === prompt.id ? "#10b981" : "white",
                    color: copiedId === prompt.id ? "white" : "#64748b",
                    fontSize: 11,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {copiedId === prompt.id ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  margin: 0,
                  color: "#0f172a",
                }}
              >
                {prompt.title}
              </h3>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              {prompt.description}
            </p>

            {/* Tags */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 12,
              }}
            >
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    background: "#f1f5f9",
                    color: "#475569",
                    borderRadius: 4,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Expanded Content */}
            {expandedPrompt === prompt.id && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                {/* Template */}
                <div style={{ marginBottom: 16 }}>
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 8,
                      color: "#334155",
                    }}
                  >
                    Template
                  </h4>
                  <pre
                    style={{
                      padding: 12,
                      background: "#f8fafc",
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: "monospace",
                      color: "#334155",
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {prompt.template}
                  </pre>
                </div>

                {/* Variables */}
                {prompt.variables && (
                  <div style={{ marginBottom: 16 }}>
                    <h4
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 8,
                        color: "#334155",
                      }}
                    >
                      Variables to Replace
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {prompt.variables.map((variable) => (
                        <code
                          key={variable}
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            background: "#dbeafe",
                            color: "#1e40af",
                            borderRadius: 4,
                            fontFamily: "monospace",
                          }}
                        >
                          {`{${variable}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example */}
                {prompt.example && (
                  <div>
                    <h4
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 8,
                        color: "#334155",
                      }}
                    >
                      Example Usage
                    </h4>
                    <div
                      style={{
                        padding: 12,
                        background: "#f0fdf4",
                        borderRadius: 6,
                        fontSize: 12,
                        color: "#166534",
                        borderLeft: "3px solid #10b981",
                      }}
                    >
                      {prompt.example}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div
        style={{
          marginTop: 32,
          padding: 24,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 12,
          color: "white",
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          💡 Pro Tips for Using Prompts
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Be Specific</h4>
            <p style={{ fontSize: 13, opacity: 0.9 }}>
              Replace all variables with concrete values from your project
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Provide Context</h4>
            <p style={{ fontSize: 13, opacity: 0.9 }}>
              Share relevant code snippets and project structure
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Iterate</h4>
            <p style={{ fontSize: 13, opacity: 0.9 }}>Refine the output with follow-up questions</p>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Verify</h4>
            <p style={{ fontSize: 13, opacity: 0.9 }}>
              Always test AI-generated code before using in production
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptLibrary;
