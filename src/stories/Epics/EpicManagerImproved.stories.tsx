import type { Meta, StoryObj } from "@storybook/react";
import EpicManager from "./EpicManager";

const meta: Meta<typeof EpicManager> = {
  title: 'Epics/Epic Manager (Improved)',
  component: EpicManager,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
}
export default meta;

export const Default: StoryObj<typeof EpicManager> = {};
