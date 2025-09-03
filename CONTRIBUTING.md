# Contributing to AI-OS-CE

Thank you for your interest in contributing to AI-OS-CE! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Workflow Process](#workflow-process)
- [Coding Standards](#coding-standards)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors.

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.17
- npm >= 9.0
- Git
- GitHub CLI (optional but recommended)

### Quick Start

```bash
# Fork and clone the repository
gh repo fork MarcoPWx/AI-OS-CE --clone

# Install dependencies
npm install

# Lint and integrity
npm run lint
npm run integrity:check
```

## 💻 Development Setup

### 1. Fork and Clone

```bash
# Using GitHub CLI
gh repo fork MarcoPWx/AI-OS-CE --clone

# Or traditional Git
git clone https://github.com/YOUR_USERNAME/AI-OS-CE.git
cd AI-OS-CE
git remote add upstream https://github.com/MarcoPWx/AI-OS-CE.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Git Hooks (Optional)

```bash
npm run prepare  # Sets up Husky for pre-commit hooks
```

### 4. Verify Setup

```bash
npm run lint           # ESLint should succeed
npm run integrity:check
```

## 🔄 How to Contribute

### Types of Contributions

#### 🐛 Reporting Bugs

- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Include detailed steps to reproduce
- Add screenshots if applicable
- Specify your environment details

#### ✨ Suggesting Features

- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Explain the problem it solves
- Provide use cases
- Consider alternatives

#### 📚 Improving Documentation

- Fix typos or clarify existing docs
- Add examples or tutorials
- Translate documentation
- Improve inline code comments


#### 💻 Contributing Code

- Fix bugs
- Implement new features
- Improve performance
- Refactor existing code

## 📋 Workflow Process

### 1. Find or Create an Issue

```bash
# Check existing issues
gh issue list --label "good first issue"
gh issue list --label "help wanted"

# Create new issue
./scripts/gh-workflows.sh quick-issue feature "Your feature idea"
```

### 2. Create a Feature Branch

```bash
# Using our helper script
./scripts/gh-workflows.sh new-feature "Feature name" "Description"

# Or manually
git checkout dev
git pull origin dev
git checkout -b feature/issue-NUMBER-description
```

### 3. Make Your Changes

Follow our [coding standards](#coding-standards) and ensure:

- Code is properly formatted
- Documentation is updated
- No console errors

### 4. Commit Your Changes

Use [conventional commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>: <description>
git commit -m "feat: Add dark mode support"
git commit -m "fix: Resolve navigation menu overflow"
git commit -m "docs: Update API documentation"
```

**Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 5. Push Your Branch

```bash
git push -u origin feature/issue-NUMBER-description
```

### 6. Create a Pull Request

```bash
# Using our helper script
./scripts/gh-workflows.sh create-pr

# Or using GitHub CLI
gh pr create --base dev --title "feat: Your feature" --body "Closes #NUMBER"
```

### 7. Address Review Comments

- Respond to all feedback
- Make requested changes
- Re-request review when ready

### 8. Merge

Once approved, your PR will be merged by a maintainer.

## 📏 Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Good
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ Bad
export function calc(i) {
  let t = 0;
  for (let x of i) t += x.p;
  return t;
}
```

### React Components

```tsx
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// ❌ Bad
export const Button = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

### File Organization

```
src/
├── utils/            # Utility functions
└── types/            # TypeScript types
```

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **CSS Classes**: kebab-case

## 🧪 Testing

Testing is optional in CE. If you add tests, ensure they are deterministic and document any required setup in the PR.

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Calculates the total price of items
 * @param items - Array of items with price property
 * @returns Total price as a number
 * @example
 * const total = calculateTotal([{ price: 10 }, { price: 20 }]);
 * // Returns: 30
 */
export const calculateTotal = (items: Item[]): number => {
  // Implementation
};
```


- Add JSDoc comments to all props
- Include usage examples
- Document any side effects
- Explain complex logic


```typescript
export default {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: "A reusable button component with multiple variants",
      },
    },
  },
  argTypes: {
    label: {
      description: "Button label text",
      control: "text",
    },
  },
};
```

## 🔐 Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead:

1. Email security concerns to the maintainers
2. Include detailed description and steps to reproduce
3. Allow time for the issue to be addressed before public disclosure

### Security Best Practices

- Never commit secrets or API keys
- Validate all user inputs
- Keep dependencies updated
- Use environment variables for configuration
- Follow OWASP guidelines

## 🎯 Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow conventional commits
- [ ] PR description clearly explains changes
- [ ] Related issues are linked
- [ ] No merge conflicts with target branch
- [ ] Code has been self-reviewed
- [ ] Screenshots added for UI changes

## 🤝 Community

### Getting Help

- Check existing [documentation](./docs)
- Search [closed issues](https://github.com/MarcoPWx/AI-OS-CE/issues?q=is%3Aissue+is%3Aclosed)
- Ask in [discussions](https://github.com/MarcoPWx/AI-OS-CE/discussions)
- Join our community chat (if available)

### Recognition

Contributors will be:

- Listed in our README
- Mentioned in release notes
- Given credit in commit messages

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make AI-OS-CE better for everyone. We appreciate your time and effort!

---

**Questions?** Feel free to open an issue or discussion thread.

**Ready to contribute?** Check out our [good first issues](https://github.com/MarcoPWx/AI-OS-CE/labels/good%20first%20issue)!
