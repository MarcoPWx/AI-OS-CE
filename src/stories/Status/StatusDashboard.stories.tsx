import type { Meta, StoryObj } from "@storybook/react";
import StatusDashboard from "./StatusDashboard";

const meta: Meta<typeof StatusDashboard> = {
  title: "Status/StatusDashboard",
  component: StatusDashboard,
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
};
export default meta;

export const Default: StoryObj<typeof StatusDashboard> = {};
