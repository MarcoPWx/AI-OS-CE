# Authoring MDX (Storybook)

Status: Current
Last Updated: 2025-08-29

This guide shows common patterns for writing MDX docs pages in Storybook and how to embed interactive stories.

Basics

- Use @storybook/blocks: Meta, Canvas, Story, Controls
- Keep images and links relative to /docs or use absolute URLs
- Prefer linking stories via ?path=/story/<id>

Example: Embed a story

```mdx
import { Meta, Canvas, Story } from '@storybook/blocks';

<Meta title="Docs/Examples/Embed" />

# Embedding a story

Below we render the API Playground story inside a Canvas:

<Canvas>
  <Story id="api-playground--default" />
</Canvas>
```

Story naming conventions

- Group docs under Docs/<Section>; group demos under API/, Dev/, Live/, etc.
- Use Default, Empty, Loading, Error for scenario variants where possible.

Controls panel tips

- Surface key args via argTypes and default args
- For Swagger story, expose docExpansion, defaultModelRendering, filter, tryItOut, etc.

Linting

- We lint .md and .mdx via eslint-plugin-mdx
- Headings should be ordered; code blocks fenced; prefer absolute links in Storybook context
