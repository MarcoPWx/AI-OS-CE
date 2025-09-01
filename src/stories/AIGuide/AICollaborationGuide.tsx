import React, { useState } from "react";

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  examples?: string[];
  tips?: string[];
}

const guideSections: GuideSection[] = [
  {
    id: "prompting",
    title: "Effective Prompting",
    icon: "💬",
    content: "Learn how to write prompts that get accurate, working code on the first try.",
    examples: [
      'Bad: "Make a button component"',
      'Good: "Create a React button component with TypeScript, following our design system with primary/secondary variants, disabled state, and onClick handler"',
      'Better: "Create a button like src/components/Button.tsx but add loading state with spinner"',
    ],
    tips: [
      "Reference existing code patterns",
      "Specify technology stack explicitly",
      "Include edge cases and error handling",
      "Ask for tests alongside implementation",
    ],
  },
  {
    id: "context",
    title: "Providing Context",
    icon: "📚",
    content: "AI performs best when it understands your project structure and conventions.",
    examples: [
      "Project structure: Show AI your folder organization",
      "Tech stack: List all major dependencies and versions",
      "Conventions: Share naming patterns, file organization rules",
      "Design system: Provide color schemes, spacing units, typography",
    ],
    tips: [
      "Start conversations with project context",
      "Share relevant config files (tsconfig, eslint, etc)",
      "Provide working examples from your codebase",
      "Update AI on recent changes or decisions",
    ],
  },
  {
    id: "iteration",
    title: "Iterative Development",
    icon: "🔄",
    content: "Build complex features through incremental improvements with AI.",
    examples: [
      "Step 1: Create basic component structure",
      "Step 2: Add state management",
      "Step 3: Implement API integration",
      "Step 4: Add error handling",
      "Step 5: Write tests",
      "Step 6: Optimize performance",
    ],
    tips: [
      "Break large tasks into smaller chunks",
      "Test each iteration before moving forward",
      "Keep AI updated on what worked/failed",
      "Save working code before major changes",
    ],
  },
  {
    id: "review",
    title: "Code Review Process",
    icon: "👀",
    content: "Use AI as your first code reviewer before human review.",
    examples: [
      'Security: "Review this auth flow for vulnerabilities"',
      'Performance: "Identify performance bottlenecks in this component"',
      'Best practices: "Does this follow React best practices?"',
      'Accessibility: "Check this form for a11y issues"',
    ],
    tips: [
      "Ask AI to explain complex code",
      "Request alternative implementations",
      "Get AI to write tests for edge cases",
      "Use AI to document complex logic",
    ],
  },
  {
    id: "debugging",
    title: "AI-Assisted Debugging",
    icon: "🐛",
    content: "Leverage AI to quickly identify and fix bugs.",
    examples: [
      "Share error messages with full stack traces",
      "Provide component state when bug occurs",
      "Include browser/environment details",
      "Show working vs broken code diff",
    ],
    tips: [
      "Copy exact error messages",
      "Include relevant code context",
      "Describe expected vs actual behavior",
      "Ask for multiple solution approaches",
    ],
  },
  {
    id: "testing",
    title: "Test Generation",
    icon: "🧪",
    content: "AI excels at writing comprehensive test suites.",
    examples: [
      'Unit tests: "Write Vitest tests for this utility function"',
      'Integration: "Create tests for this API endpoint"',
      'E2E: "Write Playwright tests for this user flow"',
      'Edge cases: "What edge cases should I test?"',
    ],
    tips: [
      "Ask for both happy path and error cases",
      "Request tests before implementation (TDD)",
      "Get AI to generate test data/mocks",
      "Use AI to improve test coverage",
    ],
  },
  {
    id: "documentation",
    title: "Documentation",
    icon: "📝",
    content: "AI can maintain high-quality, up-to-date documentation.",
    examples: [
      "API docs: Generate from code signatures",
      "README: Create comprehensive project docs",
      "Comments: Add inline documentation",
      "Guides: Write user/developer guides",
    ],
    tips: [
      "Generate docs from code comments",
      "Keep docs in sync with code changes",
      "Create examples and tutorials",
      "Write migration guides for updates",
    ],
  },
  {
    id: "patterns",
    title: "Design Patterns",
    icon: "🏗️",
    content: "Learn and implement industry-standard patterns with AI guidance.",
    examples: [
      "Factory pattern for object creation",
      "Observer pattern for event handling",
      "Repository pattern for data access",
      "Composition over inheritance",
    ],
    tips: [
      "Ask AI to explain pattern benefits",
      "Request pattern-specific implementations",
      "Compare different pattern approaches",
      "Get refactoring suggestions",
    ],
  },
];

const AICollaborationGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("prompting");
  const [searchTerm, setSearchTerm] = useState("");

  const currentSection = guideSections.find((s) => s.id === activeSection) || guideSections[0];

  const filteredSections = guideSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
          🤖 AI Collaboration Guide
        </h1>
        <p style={{ color: "#64748b", fontSize: 16 }}>
          Master the art of working with AI assistants for faster, better development
        </p>
      </div>

      {/* Search Bar */}
      <div
        style={{
          marginBottom: 24,
          background: "white",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <input
          type="text"
          placeholder="Search guide topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 14,
          }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        {/* Sidebar Navigation */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 20,
            height: "fit-content",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#64748b",
              marginBottom: 16,
              textTransform: "uppercase",
            }}
          >
            Topics
          </h3>
          {filteredSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                width: "100%",
                padding: "12px 16px",
                marginBottom: 8,
                borderRadius: 8,
                border: "none",
                background: activeSection === section.id ? "#3b82f6" : "transparent",
                color: activeSection === section.id ? "white" : "#334155",
                fontSize: 14,
                fontWeight: activeSection === section.id ? 600 : 400,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = "#f1f5f9";
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: 20 }}>{section.icon}</span>
              <span>{section.title}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 48 }}>{currentSection.icon}</span>
              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                {currentSection.title}
              </h2>
            </div>
            <p style={{ fontSize: 18, color: "#64748b", lineHeight: 1.6 }}>
              {currentSection.content}
            </p>
          </div>

          {/* Examples */}
          {currentSection.examples && (
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 16,
                  color: "#334155",
                }}
              >
                Examples
              </h3>
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 8,
                  padding: 20,
                }}
              >
                {currentSection.examples.map((example, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: 12,
                      padding: 12,
                      background: "white",
                      borderRadius: 6,
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "#334155",
                      borderLeft: "3px solid #3b82f6",
                    }}
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {currentSection.tips && (
            <div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 16,
                  color: "#334155",
                }}
              >
                💡 Pro Tips
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 16,
                }}
              >
                {currentSection.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      background: "#eff6ff",
                      borderRadius: 8,
                      borderLeft: "4px solid #3b82f6",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14, color: "#1e40af" }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div
            style={{
              marginTop: 40,
              padding: 24,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 12,
              color: "white",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Ready to Try?</h3>
            <p style={{ marginBottom: 16, opacity: 0.9 }}>
              Practice these techniques with our interactive components:
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                style={{
                  padding: "8px 16px",
                  background: "white",
                  color: "#667eea",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Open Epic Manager →
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  background: "white",
                  color: "#667eea",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Try API Playground →
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  background: "white",
                  color: "#667eea",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                View CI/CD Guide →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICollaborationGuide;
