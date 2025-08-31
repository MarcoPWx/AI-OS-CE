import type { Meta, StoryObj } from "@storybook/react";
import StatusDashboard from "./StatusDashboard";

const meta: Meta<typeof StatusDashboard> = {
  title: "Status/StatusDashboard",
  component: StatusDashboard,
};
export default meta;

export const Default: StoryObj<typeof StatusDashboard> = {};
