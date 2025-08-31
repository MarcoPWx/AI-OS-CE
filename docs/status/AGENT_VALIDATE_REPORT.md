# Agent Validate Report
Date: 2025-08-30T15:08:31.555Z

- PASS: docs/status/DEVLOG.md exists
- PASS: docs/roadmap/EPICS.md exists
- PASS: docs/SYSTEM_STATUS.md exists
- PASS: .storybook/stories/AgentBoot.mdx exists
- PASS: src/stories/DevLog.stories.tsx exists
- PASS: src/stories/EpicsDoc.stories.tsx exists
- PASS: src/stories/SystemStatus.stories.tsx exists
- PASS: script:dev present
    npm run start
- PASS: script:dev:mock present
    npm run start:web:mock
- PASS: script:storybook present
    storybook dev -p 7007
- PASS: script:build present
    expo build
- PASS: script:test present
    jest
- PASS: script:test:e2e present
    playwright test
- PASS: script:test:smoke:e2e present
    playwright test -g @smoke
- PASS: script:lint present
    eslint . --ext .ts,.tsx,.js,.jsx,.md,.mdx
- PASS: script:format present
    prettier --write '**/*.{ts,tsx,js,jsx,json,md,mdx}'
- PASS: script:docs:updates present
    node scripts/docs-refresh.js && node scripts/generate-docs-manifest.js
- PASS: script:agent:validate present
    node scripts/agent-validate.js
- PASS: script:agent:sync present
    node scripts/agent-sync.js
