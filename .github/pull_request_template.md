# Pull Request Checklist

Thanks for contributing! Before requesting review:

- [ ] Base branch is `dev`
- [ ] Title is conventional (feat|fix|docs|chore|ci): short summary
- [ ] CI (lint, unit, Storybook build, a11y, E2E) passes
- [ ] README/docs updated if user-facing changes
- [ ] Stories and tests added/updated as needed

Deployment flow reminder:

- Merge into `dev`
- Promote via PR: `dev` → `staging` (CI required)
- Promote via PR: `staging` → `main` (CI required)
