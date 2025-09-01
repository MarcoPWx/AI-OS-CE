# @ai-os/storybook-toolkit

[![CI](https://github.com/MarcoPWx/AI-OS-Storybook/actions/workflows/ci.yml/badge.svg)](https://github.com/MarcoPWx/AI-OS-Storybook/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ai-os/storybook-toolkit.svg)](https://www.npmjs.com/package/@ai-os/storybook-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🚀 A complete development environment for building UI with AI assistants. Stop fighting with AI-generated code, start shipping tested components.

## ✨ Features

- 🎯 **AI-Ready Patterns** - Working examples AI can learn from
- 🧪 **Built-in Testing** - Unit, E2E, and accessibility tests included
- 🔥 **Mock-First Development** - MSW for instant API mocking
- 📊 **Live Dashboard** - See test coverage and system health
- 🎛️ **Developer Controls** - Simulate latency, errors, and edge cases
- 🤖 **Agent Boot System** - Python-based automation for docs and epics

## 🚀 Quick Start

### Create a new project

```bash
npx @ai-os/storybook-toolkit create my-app
cd my-app
npm install
npm run dev
```

### Add to existing project

```bash
npm install @ai-os/storybook-toolkit
npx create-ai-os-storybook --init
```

## 📦 What's Included

### Components

- **Epic Manager** - Full CRUD with search/filters
- **API Playground** - Test endpoints instantly
- **Network Playground** - Visualize concurrent requests
- **Status Dashboard** - Live test coverage
- **Dev Log Viewer** - Render markdown docs

### Tools

- **MSW Integration** - Mock Service Worker for API mocking
- **Playwright** - E2E testing setup
- **Vitest** - Unit testing with coverage
- **Agent Boot** - Python automation system

### Templates

- CRUD patterns
- Fetch patterns
- Table patterns
- Form handling
- Error boundaries

## 🎯 Use Cases

### 1. Build with AI assistants

```javascript
// AI sees working patterns in Epic Manager
// Generates consistent, tested code
```

### 2. Mock-first development

```javascript
// No backend? No problem
fetch("/api/items"); // Returns mock data instantly
```

### 3. Test error scenarios

```javascript
// Toolbar: Set Error Rate to 0.5
// Watch components handle failures gracefully
```

## 📚 Documentation

- [Quick Start Guide](https://github.com/MarcoPWx/AI-OS-Storybook#quick-start)
- [API Documentation](https://github.com/MarcoPWx/AI-OS-Storybook/docs)
- [Examples](https://github.com/MarcoPWx/AI-OS-Storybook/tree/main/src/stories)
- [Agent Boot System](https://github.com/MarcoPWx/AI-OS-Storybook/blob/main/AGENT_BOOT_README.md)

## 🛠️ Commands

```bash
# Development
npm run dev              # Start Storybook (port 7007)
npm run build            # Build static Storybook

# Testing
npm run test:unit        # Run unit tests
npm run test:stories     # Run accessibility tests
npm run e2e             # Run E2E tests

# Agent Boot (Python)
python3 agent_boot.py init
python3 agent_boot.py update-docs
python3 agent_boot.py create-epic --title "New Feature"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT © [MarcoPWx](https://github.com/MarcoPWx)

## 🔗 Links

- [GitHub Repository](https://github.com/MarcoPWx/AI-OS-Storybook)
- [NPM Package](https://www.npmjs.com/package/@ai-os/storybook-toolkit)
- [Report Issues](https://github.com/MarcoPWx/AI-OS-Storybook/issues)

---

<div align="center">
  <strong>Stop fighting with AI-generated code. Start shipping tested components.</strong>
</div>
