# NPM Package Publishing Checklist

## ✅ Pre-publish Checklist (ALL DONE!)

- [x] Package name: `@ai-os/storybook-toolkit`
- [x] Version: `0.1.0-beta.1`
- [x] License: MIT
- [x] README: Complete with badges, features, and usage
- [x] Dependencies: commander and fs-extra added
- [x] CI: All tests passing (green)
- [x] .npmignore: Configured to exclude unnecessary files
- [x] Package tested locally: Installs correctly
- [x] Binary executable: `create-ai-os-storybook`

## 📦 Package Details

- **Name:** @ai-os/storybook-toolkit
- **Version:** 0.1.0-beta.1
- **Size:** ~88KB packed / ~374KB unpacked
- **Files:** 54 files included
- **Main features:**
  - Complete Storybook setup
  - MSW integration
  - Testing suite (Vitest + Playwright)
  - Agent Boot system
  - CLI tool for scaffolding

## 🚀 How to Publish

### 1. First-time setup (if not done):

```bash
npm login
# Enter your npm credentials
```

### 2. Publish the beta version:

```bash
npm publish --access public --tag beta
```

### 3. After publishing, users can install with:

```bash
# Install specific beta
npm install @ai-os/storybook-toolkit@beta

# Or use npx to scaffold
npx @ai-os/storybook-toolkit create my-app
```

## 📊 Post-publish Tasks

- [ ] Check NPM page: https://www.npmjs.com/package/@ai-os/storybook-toolkit
- [ ] Update GitHub README with NPM badge
- [ ] Create GitHub release with changelog
- [ ] Announce on social media/Discord
- [ ] Monitor for issues/feedback

## 🔄 Version Management

### Current: 0.1.0-beta.1

### Next versions:

- `0.1.0-beta.2` - After fixing any reported issues
- `0.1.0` - First stable release
- `0.2.0` - New features
- `1.0.0` - Production ready

### Version bump commands:

```bash
# Beta releases
npm version prerelease --preid=beta

# Patch release (0.1.1)
npm version patch

# Minor release (0.2.0)
npm version minor

# Major release (1.0.0)
npm version major
```

## 📝 Release Notes Template

```markdown
## @ai-os/storybook-toolkit v0.1.0-beta.1

### 🎉 Initial Beta Release

First public release of the AI-OS Storybook Toolkit!

#### Features

- Complete Storybook setup with MSW integration
- Built-in testing with Vitest and Playwright
- Agent Boot system for automation
- CLI tool for quick scaffolding
- Pre-built components and patterns
- Full TypeScript support

#### Installation

\`\`\`bash
npm install @ai-os/storybook-toolkit@beta
\`\`\`

#### Quick Start

\`\`\`bash
npx @ai-os/storybook-toolkit create my-app
\`\`\`

#### Known Issues

- CLI requires Node >= 18.17
- Windows support is experimental

#### Feedback

Please report issues at: https://github.com/MarcoPWx/AI-OS-Storybook/issues
```

## ⚠️ Important Notes

1. **Scoped package**: Using `@ai-os/` requires organization or user scope on NPM
2. **Public access**: First publish needs `--access public` flag
3. **Beta tag**: Using `--tag beta` prevents it from being the default install
4. **Testing**: Package has been tested locally and installs correctly

## 🎯 Success Criteria

The package is ready when:

- [x] CI is green
- [x] Package installs without errors
- [x] CLI tool works
- [x] Documentation is complete
- [ ] Published to NPM
- [ ] GitHub release created

---

**Status: READY TO PUBLISH! 🚀**

Run: `npm publish --access public --tag beta`
