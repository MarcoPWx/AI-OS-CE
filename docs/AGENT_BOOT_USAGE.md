# 🤖 Agent Boot Usage Guide

## Quick Start

Agent Boot is your AI-powered development assistant that manages documentation, GitHub issues, and project workflow.

## Daily Workflow Commands

### 📊 1. Check Project Status (Start Your Day)
```bash
python3 tools/agent/agent_boot.py workflow-status
```
Shows:
- Current session status
- Performance metrics
- GitHub PR status
- Available GitHub integration

### 📝 2. Log Your Work (After Completing Tasks)
```bash
python3 tools/agent/agent_boot.py update-docs --content "Description of what you did"
```
- Automatically updates DEVLOG.md
- Updates SYSTEM_STATUS.md
- Tracks session with unique ID

### 📋 3. Create Epic with GitHub Issue
```bash
python3 tools/agent/agent_boot.py create-epic \
  --title "Feature Name" \
  --description "Detailed description" \
  --create-issue
```
- Creates epic in EPICS.md
- Creates GitHub issue automatically
- Returns issue URL and number

### 🔍 4. Check GitHub PR Status
```bash
python3 tools/agent/agent_boot.py github-status
```
Shows:
- Open PRs
- CI status (passing/failing/pending)
- Detailed PR information

### 🛡️ 5. Security Testing
```bash
python3 tools/agent/agent_boot.py test-security --input "user input to test"
```
Tests for:
- SQL injection patterns
- XSS vulnerabilities  
- Path traversal attacks

### 📈 6. Performance Report
```bash
python3 tools/agent/agent_boot.py performance-report
```
Shows:
- Command execution times
- Performance metrics
- Threshold violations

## Real-World Usage Examples

### Starting a New Feature
```bash
# 1. Create epic and GitHub issue
python3 tools/agent/agent_boot.py create-epic \
  --title "Add User Authentication" \
  --description "Implement JWT-based auth with refresh tokens" \
  --create-issue

# 2. Check the created issue
python3 tools/agent/agent_boot.py github-status

# 3. Start working and log progress
python3 tools/agent/agent_boot.py update-docs \
  --content "Started authentication implementation, added JWT service"
```

### End of Day Workflow
```bash
# 1. Log what you completed
python3 tools/agent/agent_boot.py update-docs \
  --content "Completed user auth flow, added tests, 95% coverage"

# 2. Check overall status
python3 tools/agent/agent_boot.py workflow-status

# 3. Review performance
python3 tools/agent/agent_boot.py performance-report
```

### Code Review Preparation
```bash
# 1. Test security of user inputs
python3 tools/agent/agent_boot.py test-security \
  --input "$USER_INPUT_VARIABLE"

# 2. Check PR status
python3 tools/agent/agent_boot.py github-status

# 3. Update docs with review notes
python3 tools/agent/agent_boot.py update-docs \
  --content "Ready for review: auth implementation with security tests passing"
```

## What Gets Updated Automatically

### 📁 DEVLOG.md
- Session tracking with timestamps
- Work descriptions
- Auto-formatted entries

### 📁 EPICS.md  
- Epic details (title, description, status)
- Progress tracking (completion %)
- Priority and timestamps
- Sorted by priority

### 📁 SYSTEM_STATUS.md
- Last updated timestamp
- Session information
- Performance metrics
- Test coverage (if available)

### 🐙 GitHub
- Issues created from epics
- Labels based on priority
- Links back to epics

## Configuration

The `.agent_boot.config.json` file stores your preferences:

```json
{
  "default_branch": "main",
  "project_name": "AI-OS-CE",
  "github_integration": true,
  "test_coverage_threshold": 80.0,
  "dev_port": 7007,
  "auto_pull": false
}
```

## Tips for AI Agents

When working with AI assistants (Claude, GPT-4, Copilot):

1. **Start sessions with status check:**
   ```bash
   python3 tools/agent/agent_boot.py workflow-status
   ```

2. **Create epics for AI-suggested features:**
   ```bash
   python3 tools/agent/agent_boot.py create-epic --title "AI Suggestion" --create-issue
   ```

3. **Log AI pair programming sessions:**
   ```bash
   python3 tools/agent/agent_boot.py update-docs --content "Pair programmed with Claude: implemented X, Y, Z"
   ```

4. **Test AI-generated code for security:**
   ```bash
   python3 tools/agent/agent_boot.py test-security --input "$AI_GENERATED_INPUT"
   ```

## Tracking Enforcement

Agent Boot enforces documentation with smart triggers:

- **After 3 changes** → Forced update reminder
- **Every 5 minutes** → Time-based update
- **Context switches** → Immediate update
- **Errors** → Automatic documentation

This prevents context loss between AI sessions!

## Quick Reference

| Command | Purpose | Updates |
|---------|---------|---------|
| `workflow-status` | Check project state | - |
| `update-docs` | Log work done | DEVLOG, STATUS |
| `create-epic` | Plan new work | EPICS, GitHub |
| `github-status` | Check PRs/CI | - |
| `test-security` | Validate inputs | - |
| `performance-report` | Check metrics | - |

## Example Output

### Creating an Epic:
```
Epic created: {
  "id": "abc123",
  "title": "Add Dark Mode",
  "github_issue": {
    "issue_number": "18",
    "url": "https://github.com/MarcoPWx/AI-OS-CE/issues/18"
  }
}
```

### Security Test:
```
Security test result: {
  "vulnerabilities": [
    {
      "type": "XSS",
      "pattern": "<script>",
      "severity": "HIGH"
    }
  ],
  "safe": false
}
```

## Integration with Development

### With npm scripts
Add to `package.json`:
```json
{
  "scripts": {
    "status": "python3 tools/agent/agent_boot.py workflow-status",
    "log": "python3 tools/agent/agent_boot.py update-docs --content",
    "epic": "python3 tools/agent/agent_boot.py create-epic --create-issue"
  }
}
```

Then use:
```bash
npm run status
npm run log "Finished feature X"
npm run epic -- --title "New Feature"
```

### With Git Hooks
Add to `.git/hooks/post-commit`:
```bash
#!/bin/bash
python3 tools/agent/agent_boot.py update-docs --content "Committed: $(git log -1 --pretty=%B)"
```

## Troubleshooting

### GitHub CLI Not Working
```bash
# Install GitHub CLI
brew install gh  # macOS
# or
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg

# Authenticate
gh auth login
```

### Python Dependencies
```bash
# No external dependencies needed!
# Uses only Python standard library
```

### Permission Issues
```bash
# Make executable
chmod +x tools/agent/agent_boot.py
```

---

Start using Agent Boot to keep perfect documentation and never lose context again! 🚀
