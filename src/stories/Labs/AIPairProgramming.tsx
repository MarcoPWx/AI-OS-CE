import React, { useState } from "react";

interface Exercise {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  description: string;
  task: string;
  hints: string[];
  solution?: string;
  learningOutcomes: string[];
}

const exercises: Exercise[] = [
  {
    id: "1",
    title: "Component from Scratch",
    difficulty: "beginner",
    estimatedTime: "15 mins",
    description: "Learn to describe UI requirements clearly to AI",
    task: "Ask AI to create a notification badge component with: count display, color variants (info, warning, error), max count of 99+, and proper TypeScript types.",
    hints: [
      "Reference existing component structure (like Epic Manager)",
      "Specify exact prop names and types",
      "Ask for both component and story file",
      "Request unit tests alongside",
    ],
    solution:
      'Example prompt: "Create a React TypeScript NotificationBadge component with props: count (number), variant (info|warning|error), max (number, default 99). Show 99+ when count exceeds max. Include Storybook story with all variants."',
    learningOutcomes: [
      "Clear requirement specification",
      "TypeScript integration",
      "Component + Story pattern",
    ],
  },
  {
    id: "2",
    title: "Debug with AI Assistant",
    difficulty: "beginner",
    estimatedTime: "10 mins",
    description: "Practice effective debugging communication",
    task: 'Take this broken code and ask AI to identify and fix the issue:\n\nconst [data, setData] = useState()\nuseEffect(() => {\n  fetch("/api/users")\n  setData(response.json())\n}, [])',
    hints: [
      "Share the exact error message",
      "Mention the expected behavior",
      "Ask AI to explain what went wrong",
      "Request the corrected version with comments",
    ],
    solution:
      "The code has multiple issues: no async/await, accessing response before it exists, missing dependency handling. AI should identify these and provide proper async implementation.",
    learningOutcomes: [
      "Error message interpretation",
      "Async/await patterns",
      "useEffect best practices",
    ],
  },
  {
    id: "3",
    title: "Refactor for Performance",
    difficulty: "intermediate",
    estimatedTime: "20 mins",
    description: "Use AI to optimize React component performance",
    task: "Ask AI to refactor a component that re-renders unnecessarily. Provide a component with multiple useState calls, inline functions, and unoptimized lists.",
    hints: [
      "Ask about React.memo usage",
      "Inquire about useCallback and useMemo",
      "Request performance measurement code",
      "Get AI to explain each optimization",
    ],
    solution:
      "AI should suggest: React.memo wrapper, useCallback for handlers, useMemo for expensive computations, key prop optimization, and React DevTools Profiler usage.",
    learningOutcomes: [
      "React performance patterns",
      "Memoization strategies",
      "Performance profiling",
    ],
  },
  {
    id: "4",
    title: "API Integration Pattern",
    difficulty: "intermediate",
    estimatedTime: "25 mins",
    description: "Build a complete data fetching solution with AI",
    task: "Create a custom hook for API calls with: loading states, error handling, retry logic, and abort controller. Use it in a component.",
    hints: [
      "Reference the API Playground component",
      "Ask for TypeScript generics",
      "Request both hook and usage example",
      "Include MSW mock handler",
    ],
    solution:
      "Custom useApi hook with <T> generic, AbortController cleanup, exponential backoff retry, and proper error boundaries.",
    learningOutcomes: [
      "Custom hooks pattern",
      "Error handling strategies",
      "TypeScript generics",
      "MSW integration",
    ],
  },
  {
    id: "5",
    title: "Test-Driven Development",
    difficulty: "intermediate",
    estimatedTime: "30 mins",
    description: "Practice TDD workflow with AI assistance",
    task: "Build a form validation utility using TDD. Start by asking AI to write tests for: email validation, password strength, and form submission. Then implement the functions.",
    hints: [
      "Ask for tests first (red phase)",
      "Implement minimal code to pass (green phase)",
      "Request refactoring suggestions (refactor phase)",
      "Use Vitest for testing",
    ],
    solution:
      "Complete TDD cycle with comprehensive test suite, validation functions, and integration with React Hook Form or similar.",
    learningOutcomes: [
      "TDD methodology",
      "Test-first mindset",
      "Validation patterns",
      "Form handling",
    ],
  },
  {
    id: "6",
    title: "Architecture Decision",
    difficulty: "advanced",
    estimatedTime: "30 mins",
    description: "Use AI as architecture consultant",
    task: "Design a real-time collaboration feature (like Google Docs). Ask AI to help choose between WebSockets, SSE, and polling. Implement a proof of concept.",
    hints: [
      "Discuss trade-offs with AI",
      "Ask for scalability considerations",
      "Request example implementations",
      "Get AI to create comparison matrix",
    ],
    solution:
      "WebSocket implementation with reconnection logic, state synchronization, and conflict resolution strategy.",
    learningOutcomes: [
      "Architecture decisions",
      "Real-time patterns",
      "Trade-off analysis",
      "Proof of concept development",
    ],
  },
  {
    id: "7",
    title: "CI/CD Pipeline Setup",
    difficulty: "advanced",
    estimatedTime: "45 mins",
    description: "Create a complete CI/CD pipeline with AI guidance",
    task: "Set up a GitHub Actions workflow that: runs tests, checks coverage, builds Storybook, deploys to preview environment, and comments on PR with results.",
    hints: [
      "Reference existing .github/workflows/ci.yml",
      "Ask for environment secrets setup",
      "Request deployment strategies",
      "Include rollback procedures",
    ],
    solution:
      "Complete workflow with matrix testing, parallel jobs, artifact caching, and automated deployments.",
    learningOutcomes: [
      "CI/CD concepts",
      "GitHub Actions syntax",
      "Deployment strategies",
      "Environment management",
    ],
  },
  {
    id: "8",
    title: "Code Review Simulation",
    difficulty: "advanced",
    estimatedTime: "20 mins",
    description: "Practice code review with AI",
    task: "Submit a component with intentional issues (security, performance, accessibility) and ask AI to review it. Fix issues based on feedback.",
    hints: [
      "Include XSS vulnerability",
      "Add accessibility issues",
      "Create performance problems",
      "Ask for severity ratings",
    ],
    solution:
      "AI should identify: dangerouslySetInnerHTML usage, missing ARIA labels, unnecessary re-renders, and suggest fixes.",
    learningOutcomes: [
      "Security awareness",
      "Accessibility requirements",
      "Code review process",
      "Best practices",
    ],
  },
];

const AIPairProgramming: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(
    exercises[0],
  );
  const [showSolution, setShowSolution] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    new Set(),
  );
  const [currentHint, setCurrentHint] = useState(0);

  const markComplete = (exerciseId: string) => {
    setCompletedExercises(new Set([...completedExercises, exerciseId]));
  };

  const getDifficultyColor = (difficulty: Exercise["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "#10b981";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#ef4444";
    }
  };

  const progress = (completedExercises.size / exercises.length) * 100;

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
          🧪 AI Pair Programming Lab
        </h1>
        <p style={{ color: "#64748b", fontSize: 16 }}>
          Hands-on exercises to practice AI-assisted development
        </p>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>
            Your Progress
          </span>
          <span style={{ fontSize: 14, color: "#64748b" }}>
            {completedExercises.size} / {exercises.length} completed
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
              width: `${progress}%`,
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 24 }}
      >
        {/* Exercise List */}
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
              fontSize: 16,
              fontWeight: 600,
              color: "#334155",
              marginBottom: 16,
            }}
          >
            Exercises
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => {
                  setSelectedExercise(exercise);
                  setShowSolution(false);
                  setCurrentHint(0);
                }}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border:
                    selectedExercise.id === exercise.id
                      ? "2px solid #3b82f6"
                      : "1px solid #e2e8f0",
                  background:
                    selectedExercise.id === exercise.id
                      ? "#eff6ff"
                      : completedExercises.has(exercise.id)
                        ? "#f0fdf4"
                        : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}
                  >
                    {exercise.title}
                  </span>
                  {completedExercises.has(exercise.id) && (
                    <span style={{ fontSize: 16 }}>✅</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background:
                        getDifficultyColor(exercise.difficulty) + "20",
                      color: getDifficultyColor(exercise.difficulty),
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {exercise.difficulty}
                  </span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {exercise.estimatedTime}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Content */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: 8,
                  }}
                >
                  {selectedExercise.title}
                </h2>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 4,
                      background:
                        getDifficultyColor(selectedExercise.difficulty) + "20",
                      color: getDifficultyColor(selectedExercise.difficulty),
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {selectedExercise.difficulty}
                  </span>
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    ⏱️ {selectedExercise.estimatedTime}
                  </span>
                </div>
              </div>
              <button
                onClick={() => markComplete(selectedExercise.id)}
                disabled={completedExercises.has(selectedExercise.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: completedExercises.has(selectedExercise.id)
                    ? "#10b981"
                    : "#3b82f6",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: completedExercises.has(selectedExercise.id)
                    ? "default"
                    : "pointer",
                }}
              >
                {completedExercises.has(selectedExercise.id)
                  ? "✅ Completed"
                  : "Mark Complete"}
              </button>
            </div>
            <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.6 }}>
              {selectedExercise.description}
            </p>
          </div>

          {/* Task */}
          <div
            style={{
              marginBottom: 24,
              padding: 20,
              background: "#f8fafc",
              borderRadius: 8,
              borderLeft: "4px solid #3b82f6",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: "#334155",
              }}
            >
              📝 Your Task
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#334155",
                lineHeight: 1.6,
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedExercise.task}
            </p>
          </div>

          {/* Hints */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#334155" }}>
                💡 Hints
              </h3>
              <button
                onClick={() =>
                  setCurrentHint(
                    Math.min(currentHint + 1, selectedExercise.hints.length),
                  )
                }
                disabled={currentHint >= selectedExercise.hints.length}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color:
                    currentHint >= selectedExercise.hints.length
                      ? "#94a3b8"
                      : "#3b82f6",
                  fontSize: 13,
                  cursor:
                    currentHint >= selectedExercise.hints.length
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Show Next Hint ({currentHint}/{selectedExercise.hints.length})
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedExercise.hints.slice(0, currentHint).map((hint, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 12,
                    background: "#eff6ff",
                    borderRadius: 6,
                    fontSize: 14,
                    color: "#1e40af",
                    borderLeft: "3px solid #3b82f6",
                  }}
                >
                  {hint}
                </div>
              ))}
              {currentHint === 0 && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    fontStyle: "italic",
                  }}
                >
                  Click &quot;Show Next Hint&quot; if you need help
                </p>
              )}
            </div>
          </div>

          {/* Learning Outcomes */}
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: "#334155",
              }}
            >
              🎯 Learning Outcomes
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {selectedExercise.learningOutcomes.map((outcome, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: "6px 12px",
                    background: "#f0fdf4",
                    borderRadius: 16,
                    fontSize: 13,
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  {outcome}
                </span>
              ))}
            </div>
          </div>

          {/* Solution */}
          {selectedExercise.solution && (
            <div>
              <button
                onClick={() => setShowSolution(!showSolution)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: showSolution ? "#fef3c7" : "white",
                  color: showSolution ? "#92400e" : "#64748b",
                  fontSize: 14,
                  cursor: "pointer",
                  marginBottom: 12,
                }}
              >
                {showSolution ? "🔒 Hide Solution" : "🔓 Show Solution"}
              </button>
              {showSolution && (
                <div
                  style={{
                    padding: 20,
                    background: "#fef3c7",
                    borderRadius: 8,
                    borderLeft: "4px solid #f59e0b",
                  }}
                >
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 8,
                      color: "#92400e",
                    }}
                  >
                    Solution Approach
                  </h4>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#78350f",
                      lineHeight: 1.6,
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedExercise.solution}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Try It Now */}
          <div
            style={{
              marginTop: 32,
              padding: 20,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 8,
              color: "white",
            }}
          >
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              🚀 Ready to Practice?
            </h4>
            <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
              Open your AI assistant (Claude, GPT-4, or Copilot) and try this
              exercise!
            </p>
            <div style={{ display: "flex", gap: 12 }}>
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
                Copy Task to Clipboard
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "1px solid white",
                  borderRadius: 6,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                View Related Component →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPairProgramming;
