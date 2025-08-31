import type { Meta, StoryObj } from "@storybook/react";
import EpicManager from "./EpicManager";

const meta: Meta<typeof EpicManager> = {
  title: "Epics/Epic Manager (Improved)",
  component: EpicManager,
};
export default meta;

export const Default: StoryObj<typeof EpicManager> = {};
