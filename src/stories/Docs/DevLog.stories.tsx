import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

const DevLogDoc: React.FC = () => (
  <div style={{ padding: 16 }}>
    <h3>Dev Log</h3>
    <p>See docs in docs/status/ for live content.</p>
  </div>
);

const meta: Meta<typeof DevLogDoc> = {
  title: "Docs/DevLog",
  component: DevLogDoc,
};
export default meta;

export const Default: StoryObj<typeof DevLogDoc> = {};
