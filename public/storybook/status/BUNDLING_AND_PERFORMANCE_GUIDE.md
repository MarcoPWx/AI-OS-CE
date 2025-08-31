# Bundling, Tree Shaking, Code Splitting, and Lazy Loading

Status: Current
Last Updated: 2025-08-29

This guide explains how our web Storybook (and the web build more generally) is bundled, how to analyze bundles, and how to apply tree shaking and code splitting (lazy loading) effectively. It’s designed as a learning session you can read end-to-end.

Key concepts

- Bundling: Vite (Rollup) composes your modules into optimized chunks. Storybook 8 uses @storybook/react-vite under the hood.
- Tree shaking: Dead code elimination relies on ESM (import/export) and sideEffect-free modules. Use named imports and avoid mixing CommonJS.
- Code splitting: Split code into chunks so users only download what they need. Dynamic import() and React.lazy create split points.
- Lazy loading: On-demand load a component or feature using React.lazy/Suspense.
- Vendor grouping: (Optional) Use manualChunks to create stable vendor groups for caching.

Analyze bundles (Storybook)

- Generate a bundle analysis HTML via:
  - npm run analyze:storybook
  - Artifact is storybook-bundle.html (also uploaded by CI in Storybook Build workflow)
- Inspect: look for large modules; consider lazy-loading or lighter subpaths.

Tree shaking tips

- Prefer ESM-only dependencies where possible
- Use subpath imports (e.g., date-fns/format) to avoid pulling whole libraries
- Mark side-effect-free packages (package.json "sideEffects": false) when authoring internal packages
- Avoid index barrels that re-export too much; tree shaking is less effective when symbols are obscured

Code splitting patterns (React)

- Route-level splits (app-level): lazy-load screens/routes
- Feature-level splits (Storybook/app): lazy-load heavy components (charts, editors)
- Third-party library splits: gate large libraries behind dynamic import() only when needed

React examples

- React.lazy + Suspense

  ```tsx
  const HeavyWidget = React.lazy(() => import('./heavy/HeavyWidget'));

  export function CodeSplitExample() {
    return (
      <React.Suspense fallback={<div>Loading…</div>}>
        <HeavyWidget complexity={3} />
      </React.Suspense>
    );
  }
  ```

- Dynamic import inside an event
  ```ts
  async function onClick() {
    const { expensiveFn } = await import('./expensive/compute');
    const result = expensiveFn(data);
    setResult(result);
  }
  ```

Vendor grouping (optional, advanced)

- With Vite/Rollup, you can group stable vendor chunks using manualChunks for better browser caching:
  ```ts
  // vite.config.ts (illustrative)
  export default defineConfig({
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
              if (id.includes('swagger-ui') || id.includes('msw')) return 'devtools-vendor';
            }
          },
        },
      },
    },
  });
  ```
- In our Storybook pipeline, we primarily rely on analyze-storybook to highlight targets; apply manual chunks only when you’ve validated real improvements.

Pruning dead dependencies

- Use bundle analysis to identify unused or oversized libraries.
- Replace with lighter alternatives or subpath imports.
- Remove truly unused deps.

Caching and chunk naming

- Rollup produces hashed filenames for cache-busting.
- Keep vendor chunks stable by avoiding frequent changes to common imports when possible.

What we’ve implemented here

- Storybook bundle analysis command and CI artifact upload
- A Code Split Demo story that lazy-loads a component to illustrate on-demand chunks
- Documentation (this guide) and a Storybook page linking to it

Where to start

- Open Docs/Bundling & Performance in Storybook and try the Code Split Demo. Then run npm run analyze:storybook and review storybook-bundle.html.

Related docs

- docs/status/AUTHORING_MDX_GUIDE.md (authoring patterns)
- docs/STORYBOOK_TESTING.md (test runner)
- docs/mocks/SERVICE_MOCKING_COVERAGE.md (MSW coverage)
