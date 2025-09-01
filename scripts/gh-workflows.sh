#!/bin/bash

# GitHub CLI Workflow Helper Scripts
# Usage: ./scripts/gh-workflows.sh [command] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed"
        echo "Install it from: https://cli.github.com/"
        exit 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub"
        echo "Run: gh auth login"
        exit 1
    fi
}

# Create a new feature branch and issue
new_feature() {
    local title="$1"
    local description="$2"
    
    if [ -z "$title" ]; then
        echo "Usage: $0 new-feature \"Feature title\" \"Optional description\""
        exit 1
    fi
    
    print_info "Creating new feature: $title"
    
    # Create issue
    issue_number=$(gh issue create \
        --title "✨ $title" \
        --body "${description:-No description provided}" \
        --label "enhancement" \
        | grep -o '[0-9]*$')
    
    print_success "Created issue #$issue_number"
    
    # Create branch
    branch_name="feature/issue-${issue_number}-$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | cut -c1-30)"
    
    git checkout dev
    git pull origin dev
    git checkout -b "$branch_name"
    
    print_success "Created and switched to branch: $branch_name"
    
    # Create initial commit
    git commit --allow-empty -m "feat: Start work on #$issue_number - $title"
    git push -u origin "$branch_name"
    
    print_success "Branch pushed to remote"
    echo ""
    print_info "Next steps:"
    echo "  1. Make your changes"
    echo "  2. Commit with: git commit -m \"feat: Your commit message\""
    echo "  3. Create PR with: $0 create-pr"
}

# Create PR from current branch
create_pr() {
    local current_branch=$(git branch --show-current)
    
    if [[ ! "$current_branch" =~ ^(feature|fix|docs|test|chore)/ ]]; then
        print_warning "Current branch ($current_branch) doesn't follow naming convention"
        echo "Expected: feature/*, fix/*, docs/*, test/*, or chore/*"
    fi
    
    # Extract issue number from branch name
    issue_number=$(echo "$current_branch" | grep -o 'issue-[0-9]*' | grep -o '[0-9]*' || echo "")
    
    # Get last commit message as default title
    last_commit=$(git log -1 --pretty=%B | head -n1)
    
    print_info "Creating PR from branch: $current_branch"
    
    # Create PR
    if [ -n "$issue_number" ]; then
        gh pr create \
            --base dev \
            --title "$last_commit" \
            --body "Closes #$issue_number" \
            --label "needs-review"
    else
        gh pr create \
            --base dev \
            --title "$last_commit" \
            --label "needs-review"
    fi
    
    print_success "PR created successfully"
}

# Quick PR review
review_pr() {
    local pr_number="$1"
    local action="$2"
    
    if [ -z "$pr_number" ]; then
        # Show PRs needing review
        print_info "PRs waiting for your review:"
        gh pr list --search "is:pr is:open review-requested:@me"
        echo ""
        echo "Usage: $0 review-pr [PR_NUMBER] [approve|request-changes|comment]"
        exit 0
    fi
    
    case "$action" in
        approve)
            gh pr review "$pr_number" --approve --body "LGTM! 🚀"
            print_success "PR #$pr_number approved"
            ;;
        request-changes)
            gh pr review "$pr_number" --request-changes --body "Please see comments"
            print_warning "Changes requested for PR #$pr_number"
            ;;
        comment|*)
            gh pr review "$pr_number" --comment --body "${3:-Reviewing...}"
            print_info "Comment added to PR #$pr_number"
            ;;
    esac
}

# Quick issue management
quick_issue() {
    local type="$1"
    local title="$2"
    
    case "$type" in
        bug)
            gh issue create \
                --title "🐛 $title" \
                --label "bug,priority:p1" \
                --template bug_report.md
            ;;
        feature)
            gh issue create \
                --title "✨ $title" \
                --label "enhancement,priority:p2" \
                --template feature_request.md
            ;;
        task)
            gh issue create \
                --title "📋 $title" \
                --label "task" \
                --template task.md
            ;;
        *)
            echo "Usage: $0 quick-issue [bug|feature|task] \"Title\""
            exit 1
            ;;
    esac
    
    print_success "Issue created"
}

# Check CI status
ci_status() {
    local branch="${1:-$(git branch --show-current)}"
    
    print_info "Checking CI status for branch: $branch"
    
    # Show workflow runs
    gh run list --branch "$branch" --limit 5
    
    # Show PR checks if PR exists
    pr_number=$(gh pr list --head "$branch" --json number --jq '.[0].number' 2>/dev/null || echo "")
    
    if [ -n "$pr_number" ]; then
        echo ""
        print_info "PR #$pr_number checks:"
        gh pr checks "$pr_number"
    fi
}

# Sync fork with upstream
sync_fork() {
    print_info "Syncing fork with upstream..."
    
    # Add upstream if not exists
    if ! git remote | grep -q upstream; then
        print_info "Adding upstream remote..."
        gh repo sync --source
    fi
    
    # Sync branches
    git fetch upstream
    git checkout main
    git merge upstream/main
    git push origin main
    
    git checkout dev
    git merge upstream/dev
    git push origin dev
    
    print_success "Fork synced with upstream"
}

# List my work
my_work() {
    print_info "Your open issues:"
    gh issue list --assignee "@me" --limit 10
    
    echo ""
    print_info "Your open PRs:"
    gh pr list --author "@me" --limit 10
    
    echo ""
    print_info "PRs needing your review:"
    gh pr list --search "is:pr is:open review-requested:@me" --limit 10
}

# Create release
create_release() {
    local version="$1"
    local notes="$2"
    
    if [ -z "$version" ]; then
        echo "Usage: $0 create-release [version] \"Release notes\""
        echo "Example: $0 create-release v1.0.0 \"Initial release\""
        exit 1
    fi
    
    print_info "Creating release $version..."
    
    # Create tag if not exists
    if ! git tag | grep -q "^$version$"; then
        git tag "$version"
        git push origin "$version"
    fi
    
    # Create release
    gh release create "$version" \
        --title "Release $version" \
        --notes "${notes:-Release $version}" \
        --target main
    
    print_success "Release $version created"
}

# Main command handler
case "$1" in
    new-feature)
        check_gh_cli
        new_feature "$2" "$3"
        ;;
    create-pr)
        check_gh_cli
        create_pr
        ;;
    review-pr)
        check_gh_cli
        review_pr "$2" "$3" "$4"
        ;;
    quick-issue)
        check_gh_cli
        quick_issue "$2" "$3"
        ;;
    ci-status)
        check_gh_cli
        ci_status "$2"
        ;;
    sync-fork)
        check_gh_cli
        sync_fork
        ;;
    my-work)
        check_gh_cli
        my_work
        ;;
    create-release)
        check_gh_cli
        create_release "$2" "$3"
        ;;
    *)
        echo "GitHub CLI Workflow Helper"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  new-feature \"Title\" \"Description\"  - Create issue and feature branch"
        echo "  create-pr                          - Create PR from current branch"
        echo "  review-pr [PR] [action]            - Review a PR (approve/request-changes/comment)"
        echo "  quick-issue [type] \"Title\"         - Create issue (bug/feature/task)"
        echo "  ci-status [branch]                 - Check CI status for branch"
        echo "  sync-fork                          - Sync fork with upstream"
        echo "  my-work                            - Show your issues, PRs, and reviews"
        echo "  create-release [version] \"Notes\"   - Create a new release"
        echo ""
        echo "Examples:"
        echo "  $0 new-feature \"Add dark mode\" \"Implement dark mode theme\""
        echo "  $0 create-pr"
        echo "  $0 review-pr 15 approve"
        echo "  $0 quick-issue bug \"Navigation menu broken\""
        echo "  $0 ci-status feature/dark-mode"
        echo ""
        exit 0
        ;;
esac
