// src/stories/CodeSplitDemo.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const HeavyWidget = React.lazy(() => import('./heavy/HeavyWidget'));

function CodeSplitDemo() {
  return (
    <div style={{ padding: 16 }}>
      <h3>Code Split Demo (React.lazy)</h3>
      <p>
        This demo lazy-loads a child component in a separate chunk. Use your network tab when it
        mounts to see the chunk load.
      </p>
      <React.Suspense fallback={<div>Loading heavy widget…</div>}>
        <HeavyWidget complexity={3} />
      </React.Suspense>
    </div>
  );
}

const meta = {
  title: 'Dev/CodeSplitDemo',
  component: CodeSplitDemo,
  parameters: {
    docs: {
      description: {
        component: 'Demonstrates React.lazy + Suspense to split code into a separate chunk.',
      },
    },
  },
} satisfies Meta<typeof CodeSplitDemo>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
