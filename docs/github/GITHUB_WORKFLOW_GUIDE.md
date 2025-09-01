# GitHub Workflow Guide

## 📋 Table of Contents

1. [Branching Strategy](#branching-strategy)
2. [Issue Management](#issue-management)
3. [Pull Request Workflow](#pull-request-workflow)
4. [Code Review Process](#code-review-process)
5. [GitHub CLI Commands](#github-cli-commands)
6. [Automation & CI/CD](#automation--cicd)
7. [Best Practices](#best-practices)

---

## 🌳 Branching Strategy

### Branch Structure

```
main (production)
├── dev (integration)
│   ├── feature/* (new features)
│   ├── fix/* (bug fixes)
│   ├── docs/* (documentation)
│   └── test/* (testing improvements)
└── hotfix/* (urgent production fixes)
```

### Branch Naming Convention

- `feature/issue-{number}-short-description` (e.g., `feature/7-unit-tests`)
- `fix/issue-{number}-bug-description` (e.g., `fix/23-navigation-error`)
- `docs/section-update` (e.g., `docs/api-documentation`)
- `test/component-name` (e.g., `test/ai-collaboration-guide`)
- `hotfix/critical-issue` (e.g., `hotfix/security-patch`)

### Creating and Managing Branches

```bash
# Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/issue-7-unit-tests

# Push branch to remote
git push -u origin feature/issue-7-unit-tests

# Keep branch updated with dev
git checkout dev
git pull origin dev
git checkout feature/issue-7-unit-tests
git merge dev  # or rebase: git rebase dev
```

---

## 📝 Issue Management

### Issue Types & Labels

#### Priority Labels

- `priority:p0` - Critical, blocking
- `priority:p1` - High priority
- `priority:p2` - Medium priority
- `priority:p3` - Low priority

#### Type Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `testing` - Test-related work
- `performance` - Performance improvements
- `security` - Security issues
- `tech-debt` - Code refactoring

#### Epic Labels

- `epic:testing` - Testing & QA
- `epic:documentation` - Documentation
- `epic:ai-features` - AI Features
- `epic:infrastructure` - Infrastructure

### Creating Issues via CLI

```bash
# Create bug report
gh issue create \
  --title "🐛 Navigation menu not responsive on mobile" \
  --body "## Bug Description\n..." \
  --label "bug,priority:p1" \
  --assignee "@me"

# Create feature request
gh issue create \
  --title "✨ Add dark mode support" \
  --body "## Feature Request\n..." \
  --label "enhancement,priority:p2" \
  --milestone "Q4 2024"

# Create task from template
gh issue create --template task.md
```

### Issue Templates

```bash
# List available templates
gh issue create --help

# Use specific template
gh issue create --template bug_report.md
```

### Managing Issues

```bash
# List all open issues
gh issue list

# List issues assigned to you
gh issue list --assignee "@me"

# List issues by label
gh issue list --label "priority:p0"

# View issue details
gh issue view 7

# Comment on issue
gh issue comment 7 --body "Starting work on this now"

# Close issue with comment
gh issue close 7 --comment "Fixed in PR #15"

# Reopen issue
gh issue reopen 7

# Edit issue
gh issue edit 7 --title "Updated title" --add-label "testing"

# Create issue and get number
ISSUE_NUM=$(gh issue create --title "Test" --body "Test" | grep -o '[0-9]*$')
```

---

## 🔄 Pull Request Workflow

### Creating Pull Requests

#### Standard PR Creation

```bash
# Create PR from current branch
gh pr create \
  --title "feat: Add unit tests for AI components" \
  --body "## Description\n..." \
  --base dev \
  --head feature/issue-7-unit-tests \
  --label "testing,enhancement" \
  --assignee "@me" \
  --reviewer "MarcoPWx"

# Create draft PR
gh pr create --draft --title "WIP: Feature implementation"

# Create PR with issue linking
gh pr create \
  --title "feat: Add unit tests for AI components" \
  --body "Closes #7\n\n## Description..." \
  --base dev
```

#### PR Title Conventions

Use conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process or auxiliary tool changes
- `perf:` - Performance improvements

Examples:

```bash
feat: Add AI collaboration guide component
fix: Resolve navigation menu overflow on mobile
docs: Update API documentation for prompt library
test: Add E2E tests for CI/CD workflow component
chore: Update GitHub Actions workflow
```

### PR Body Template

```markdown
## 🎯 Overview

Brief description of what this PR does

## 🔗 Related Issues

Closes #7
Related to #14

## ✨ Changes Made

- Added unit tests for AICollaborationGuide
- Implemented test coverage reporting
- Fixed edge cases in prompt validation

## 📸 Screenshots/Recordings

(if applicable)

## 🧪 Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] No console errors

## 📋 Checklist

- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] TypeScript types properly defined
- [ ] Accessibility considered
- [ ] Performance impact assessed

## 💭 Notes for Reviewers

Any specific areas that need attention
```

### Managing Pull Requests

```bash
# List PRs
gh pr list
gh pr list --state all
gh pr list --author "@me"
gh pr list --search "is:pr is:open review-requested:@me"

# View PR details
gh pr view 15
gh pr view 15 --web  # Open in browser

# Check PR status
gh pr status

# Checkout PR locally
gh pr checkout 15

# Add reviewers
gh pr edit 15 --add-reviewer "username1,username2"

# Add labels
gh pr edit 15 --add-label "ready-for-review"

# Convert to draft/ready
gh pr ready 15  # Mark as ready for review
gh pr edit 15 --draft  # Convert to draft

# Merge PR
gh pr merge 15 --merge  # Create merge commit
gh pr merge 15 --squash  # Squash and merge
gh pr merge 15 --rebase  # Rebase and merge

# Close without merging
gh pr close 15
```

---

## 👀 Code Review Process

### For Reviewers

#### Review Checklist

1. **Code Quality**
   - [ ] Clear, readable code
   - [ ] Proper naming conventions
   - [ ] No code duplication
   - [ ] Appropriate comments

2. **Functionality**
   - [ ] Meets requirements
   - [ ] Edge cases handled
   - [ ] Error handling appropriate
   - [ ] No breaking changes

3. **Testing**
   - [ ] Tests included
   - [ ] Tests pass
   - [ ] Adequate coverage

4. **Performance**
   - [ ] No obvious performance issues
   - [ ] Efficient algorithms used
   - [ ] No memory leaks

5. **Security**
   - [ ] No exposed secrets
   - [ ] Input validation
   - [ ] Proper authentication/authorization

#### Review Commands

```bash
# Start review
gh pr review 15 --comment --body "Starting review"

# Approve PR
gh pr review 15 --approve --body "LGTM! Great work!"

# Request changes
gh pr review 15 --request-changes --body "Please address the comments"

# Add inline comments (interactive)
gh pr review 15

# View PR diff
gh pr diff 15

# View PR checks status
gh pr checks 15
```

### For Authors

#### Responding to Reviews

```bash
# View review comments
gh pr view 15 --comments

# Respond to review
gh pr comment 15 --body "Thanks for the review! I've addressed all comments."

# Request re-review
gh pr edit 15 --add-reviewer "reviewer-username"

# View review status
gh pr view 15 --json reviews
```

---

## 💻 GitHub CLI Commands

### Essential Commands Reference

#### Repository Management

```bash
# Clone repo
gh repo clone MarcoPWx/AI-OS-Storybook

# Fork repo
gh repo fork MarcoPWx/AI-OS-Storybook --clone

# View repo info
gh repo view

# Create repo
gh repo create my-project --public --clone

# Set default repo
gh repo set-default
```

#### Workflow Commands

```bash
# List workflows
gh workflow list

# View workflow runs
gh run list
gh run list --workflow=ci.yml

# View run details
gh run view <run-id>

# Watch run in real-time
gh run watch

# Rerun failed workflow
gh run rerun <run-id> --failed

# Download artifacts
gh run download <run-id>

# View workflow logs
gh run view <run-id> --log
```

#### Release Management

```bash
# Create release
gh release create v1.0.0 \
  --title "Version 1.0.0" \
  --notes "Initial release" \
  --target main

# List releases
gh release list

# Download release assets
gh release download v1.0.0

# Delete release
gh release delete v1.0.0
```

#### Alias Creation

```bash
# Create useful aliases
gh alias set prs "pr list --author @me"
gh alias set reviews "pr list --search 'is:pr is:open review-requested:@me'"
gh alias set issues "issue list --assignee @me"
gh alias set ci "run list --limit 5"

# List aliases
gh alias list
```

---

## 🤖 Automation & CI/CD

### GitHub Actions Workflow

#### PR Checks Workflow

```yaml
name: PR Checks
on:
  pull_request:
    branches: [main, dev]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run type-check
```

#### Auto-labeler

```yaml
name: Auto Label
on:
  pull_request:
    types: [opened, edited]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v4
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

### Branch Protection Rules

#### For `main` branch:

- Require PR before merging
- Require approvals: 2
- Dismiss stale reviews
- Require status checks:
  - CI/Build
  - Tests
  - Linting
- Require branches to be up to date
- Include administrators
- Restrict who can push

#### For `dev` branch:

- Require PR before merging
- Require approvals: 1
- Require status checks:
  - Tests
  - Linting

### Setting Protection via CLI

```bash
# Note: Branch protection rules are better set via GitHub UI
# But can be configured via API:

gh api repos/MarcoPWx/AI-OS-Storybook/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["continuous-integration"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2}'
```

---

## 🎯 Best Practices

### Commit Messages

1. Use conventional commits format
2. Keep subject line under 50 characters
3. Use imperative mood ("Add" not "Added")
4. Reference issues when applicable

```bash
# Good examples
git commit -m "feat: Add unit tests for AI collaboration guide

- Implement comprehensive test suite
- Add snapshot testing
- Include edge case coverage

Closes #7"
```

### Pull Request Best Practices

1. **Keep PRs small and focused**
   - Single feature/fix per PR
   - Easier to review
   - Faster to merge

2. **Update regularly**

   ```bash
   # Keep PR up to date with base branch
   git checkout feature/my-feature
   git fetch origin
   git rebase origin/dev
   git push --force-with-lease
   ```

3. **Use draft PRs for work in progress**

   ```bash
   gh pr create --draft --title "WIP: Feature implementation"
   ```

4. **Link related issues**
   - Use "Closes #X" to auto-close issues
   - Use "Related to #X" for related issues

5. **Provide context**
   - Clear description
   - Screenshots for UI changes
   - Testing instructions

### Issue Management Best Practices

1. **Use templates** for consistency
2. **Add labels** immediately
3. **Assign to appropriate milestone**
4. **Link PRs** to issues
5. **Keep issues updated** with progress

### Code Review Best Practices

1. **Review promptly** (within 24 hours)
2. **Be constructive** in feedback
3. **Suggest specific improvements**
4. **Approve explicitly** when satisfied
5. **Use "Request changes"** sparingly

---

## 📚 Quick Reference

### Common Workflows

#### Start New Feature

```bash
# 1. Create issue
ISSUE=$(gh issue create --title "Add new feature" --body "..." | grep -o '[0-9]*$')

# 2. Create branch
git checkout dev
git pull origin dev
git checkout -b feature/issue-$ISSUE-feature-name

# 3. Work on feature
# ... make changes ...

# 4. Commit changes
git add .
git commit -m "feat: Add new feature"

# 5. Push branch
git push -u origin feature/issue-$ISSUE-feature-name

# 6. Create PR
gh pr create --title "feat: Add new feature" --body "Closes #$ISSUE" --base dev
```

#### Review and Merge PR

```bash
# 1. Check out PR
gh pr checkout 15

# 2. Test locally
npm test
npm run build

# 3. Review code
gh pr diff 15

# 4. Approve
gh pr review 15 --approve

# 5. Merge
gh pr merge 15 --squash
```

#### Hotfix Process

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix issue
# ... make changes ...

# 3. Create PR to main
gh pr create --title "hotfix: Fix critical bug" --base main

# 4. After merge, sync to dev
git checkout dev
git pull origin main
git push origin dev
```

---

## 🔗 Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)

---

## 🆘 Troubleshooting

### Common Issues

#### PR Conflicts

```bash
# Resolve conflicts locally
git checkout feature/my-feature
git fetch origin
git rebase origin/dev
# Resolve conflicts in editor
git add .
git rebase --continue
git push --force-with-lease
```

#### Accidentally Committed to Wrong Branch

```bash
# Move commits to new branch
git checkout -b correct-branch
git checkout wrong-branch
git reset --hard HEAD~n  # n = number of commits to remove
git checkout correct-branch
```

#### Need to Update PR After Force Push

```bash
# Force push safely
git push --force-with-lease origin feature/my-feature
```

#### Can't Push to Protected Branch

```bash
# Create PR instead
gh pr create --title "My changes" --base protected-branch
```

---

_Last Updated: September 2024_
_Maintained by: AI-OS Team_
