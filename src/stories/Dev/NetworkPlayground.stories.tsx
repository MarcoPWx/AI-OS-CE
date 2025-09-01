import type { Meta, StoryObj } from "@storybook/react";
import NetworkPlayground from "./NetworkPlayground";

const meta: Meta<typeof NetworkPlayground> = {
  title: "Dev/NetworkPlayground",
  component: NetworkPlayground,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f8fafc" },
        { name: "dark", value: "#0f172a" },
      ],
    },
  },
};
export default meta;

export const Default: StoryObj<typeof NetworkPlayground> = {};
