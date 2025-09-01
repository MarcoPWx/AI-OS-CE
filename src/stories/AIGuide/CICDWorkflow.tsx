import React, { useState } from "react";

interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "failed";
  duration?: string;
  logs?: string[];
}

interface PRRule {
  id: string;
  title: string;
  description: string;
  example?: string;
  automated: boolean;
}

const prRules: PRRule[] = [
  {
    id: "1",
    title: "Conventional Commits",
    description: "Use conventional commit format for clear history",
    example:
      "feat: add user authentication\nfix: resolve memory leak in dashboard\ndocs: update API documentation",
    automated: true,
  },
  {
    id: "2",
    title: "Branch Protection",
    description: "Main branch requires PR with reviews",
    example: "feature/* → dev → staging → main",
    automated: true,
  },
  {
    id: "3",
    title: "Code Review Requirements",
    description: "At least 2 approvals required for main branch",
    example: "✅ Architecture review\n✅ Code quality review",
    automated: true,
  },
  {
    id: "4",
    title: "Test Coverage",
    description: "Maintain minimum 80% code coverage",
    example: "Current: 85.3% ✅\nRequired: 80% minimum",
    automated: true,
  },
  {
    id: "5",
    title: "Automated Testing",
    description: "All tests must pass before merge",
    example:
      "✅ Unit tests (127 passed)\n✅ Integration tests (45 passed)\n✅ E2E tests (23 passed)",
    automated: true,
  },
  {
    id: "6",
    title: "Linting & Formatting",
    description: "Code must pass ESLint and Prettier checks",
    example: "npm run lint\nnpm run prettier:check",
    automated: true,
  },
  {
    id: "7",
    title: "Security Scanning",
    description: "No critical vulnerabilities allowed",
    example: "npm audit\nSnyk security scan",
    automated: true,
  },
  {
    id: "8",
    title: "Documentation Updates",
    description: "Update docs for API changes or new features",
    example: "README.md, API docs, Storybook stories",
    automated: false,
  },
];

const CICDWorkflow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"workflow" | "rules" | "commands">("workflow");
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { id: "1", name: "Checkout Code", status: "success", duration: "2s" },
    { id: "2", name: "Setup Node.js", status: "success", duration: "5s" },
    {
      id: "3",
      name: "Install Dependencies",
      status: "success",
      duration: "45s",
    },
    { id: "4", name: "Prettier Check", status: "success", duration: "3s" },
    { id: "5", name: "ESLint", status: "success", duration: "8s" },
    { id: "6", name: "Unit Tests", status: "running", duration: "12s" },
    { id: "7", name: "Build Storybook", status: "pending" },
    { id: "8", name: "Integration Tests", status: "pending" },
    { id: "9", name: "E2E Tests", status: "pending" },
    { id: "10", name: "Upload Artifacts", status: "pending" },
  ]);

  const [isSimulating, setIsSimulating] = useState(false);

  const simulateWorkflow = () => {
    setIsSimulating(true);
    let currentStep = 0;

    const steps = [...workflowSteps].map((s) => ({
      ...s,
      status: "pending" as const,
    }));
    setWorkflowSteps(steps);

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        steps[currentStep].status = "running";
        setWorkflowSteps([...steps]);

        setTimeout(() => {
          steps[currentStep].status = Math.random() > 0.1 ? "success" : "failed";
          steps[currentStep].duration = `${Math.floor(Math.random() * 30) + 2}s`;
          setWorkflowSteps([...steps]);
          currentStep++;

          if (currentStep >= steps.length) {
            clearInterval(interval);
            setIsSimulating(false);
          }
        }, 1500);
      }
    }, 2000);
  };

  const getStatusColor = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "success":
        return "#10b981";
      case "failed":
        return "#ef4444";
      case "running":
        return "#f59e0b";
      case "pending":
        return "#94a3b8";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "success":
        return "✅";
      case "failed":
        return "❌";
      case "running":
        return "⏳";
      case "pending":
        return "⏸️";
      default:
        return "❓";
    }
  };

  const commonCommands = [
    {
      category: "Development",
      commands: [
        { cmd: "npm run dev", desc: "Start Storybook dev server on port 7009" },
        { cmd: "npm run build", desc: "Build Storybook static files" },
        { cmd: "npm run preview", desc: "Preview built Storybook" },
      ],
    },
    {
      category: "Testing",
      commands: [
        { cmd: "npm run test:unit", desc: "Run unit tests with Vitest" },
        {
          cmd: "npm run test:unit:coverage",
          desc: "Run tests with coverage report",
        },
        {
          cmd: "npm run test:stories",
          desc: "Run Storybook accessibility tests",
        },
        { cmd: "npm run e2e", desc: "Run Playwright E2E tests" },
      ],
    },
    {
      category: "Code Quality",
      commands: [
        { cmd: "npm run lint", desc: "Run ESLint checks" },
        { cmd: "npm run lint:fix", desc: "Auto-fix ESLint issues" },
        { cmd: "npm run prettier:check", desc: "Check Prettier formatting" },
        { cmd: "npm run prettier:write", desc: "Auto-format with Prettier" },
      ],
    },
    {
      category: "Git Workflow",
      commands: [
        { cmd: "git checkout -b feature/name", desc: "Create feature branch" },
        {
          cmd: 'git add -A && git commit -m "feat: description"',
          desc: "Commit with conventional format",
        },
        { cmd: "git push origin feature/name", desc: "Push branch to remote" },
        {
          cmd: 'gh pr create --title "feat: title" --body "description"',
          desc: "Create PR with GitHub CLI",
        },
      ],
    },
    {
      category: "CI/CD",
      commands: [
        { cmd: "npm run integrity:check", desc: "Check reference integrity" },
        { cmd: "npm ci", desc: "Clean install for CI" },
        { cmd: "npx playwright install", desc: "Install Playwright browsers" },
        { cmd: "npm run ci:all", desc: "Run all CI checks locally" },
      ],
    },
  ];

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
          🚀 CI/CD & Workflow Guide
        </h1>
        <p style={{ color: "#64748b", fontSize: 16 }}>
          Understand the development workflow, PR rules, and CI/CD pipeline
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          borderBottom: "2px solid #e2e8f0",
          paddingBottom: 0,
        }}
      >
        {(["workflow", "rules", "commands"] as const).map((tab) => (
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
              marginBottom: "-2px",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {tab === "workflow" && "🔄 "}
            {tab === "rules" && "📋 "}
            {tab === "commands" && "⚡ "}
            {tab === "workflow" ? "CI Pipeline" : tab === "rules" ? "PR Rules" : "Commands"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "workflow" && (
        <div>
          {/* Pipeline Visualization */}
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
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  margin: 0,
                  color: "#334155",
                }}
              >
                CI Pipeline Execution
              </h2>
              <button
                onClick={simulateWorkflow}
                disabled={isSimulating}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: isSimulating ? "#94a3b8" : "#3b82f6",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: isSimulating ? "not-allowed" : "pointer",
                }}
              >
                {isSimulating ? "Running..." : "Simulate Workflow"}
              </button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {workflowSteps.map((step) => (
                <div
                  key={step.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: 16,
                    background: "#f8fafc",
                    borderRadius: 8,
                    borderLeft: `4px solid ${getStatusColor(step.status)}`,
                  }}
                >
                  <span style={{ fontSize: 20, marginRight: 12 }}>
                    {getStatusIcon(step.status)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#334155",
                      }}
                    >
                      {step.name}
                    </div>
                    {step.duration && (
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        Duration: {step.duration}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 4,
                      background: getStatusColor(step.status) + "20",
                      color: getStatusColor(step.status),
                      fontWeight: 500,
                      textTransform: "uppercase",
                    }}
                  >
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Diagram */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 16,
                color: "#334155",
              }}
            >
              Branch Strategy
            </h3>
            <div
              style={{
                padding: 20,
                background: "#f8fafc",
                borderRadius: 8,
                fontFamily: "monospace",
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              <div>feature/* ──→ dev ──→ staging ──→ main</div>
              <div> ↓ ↓ ↓ ↓</div>
              <div> [Tests] [Tests] [E2E Tests] [Deploy]</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "rules" && (
        <div
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          {prRules.map((rule) => (
            <div
              key={rule.id}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                borderLeft: `4px solid ${rule.automated ? "#10b981" : "#f59e0b"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    margin: 0,
                    color: "#334155",
                  }}
                >
                  {rule.title}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: rule.automated ? "#d1fae5" : "#fef3c7",
                    color: rule.automated ? "#065f46" : "#92400e",
                    fontWeight: 500,
                  }}
                >
                  {rule.automated ? "AUTOMATED" : "MANUAL"}
                </span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  marginBottom: rule.example ? 12 : 0,
                }}
              >
                {rule.description}
              </p>
              {rule.example && (
                <div
                  style={{
                    padding: 12,
                    background: "#f8fafc",
                    borderRadius: 6,
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "#334155",
                    whiteSpace: "pre-line",
                  }}
                >
                  {rule.example}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "commands" && (
        <div style={{ display: "grid", gap: 24 }}>
          {commonCommands.map((category) => (
            <div
              key={category.category}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 16,
                  color: "#334155",
                }}
              >
                {category.category}
              </h3>
              <div style={{ display: "grid", gap: 12 }}>
                {category.commands.map((cmd) => (
                  <div
                    key={cmd.cmd}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 12,
                      background: "#f8fafc",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <code
                      style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: "#0f172a",
                        background: "white",
                        padding: "4px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {cmd.cmd}
                    </code>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{cmd.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CICDWorkflow;
