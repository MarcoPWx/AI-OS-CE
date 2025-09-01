import type { Meta, StoryObj } from "@storybook/react";
import CICDWorkflow from "./CICDWorkflow";

const meta: Meta<typeof CICDWorkflow> = {
  title: "AI Guide/CI CD Workflow",
  component: CICDWorkflow,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Interactive guide showing CI/CD pipeline, PR rules, and common development commands.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

export const Default: StoryObj<typeof CICDWorkflow> = {};
