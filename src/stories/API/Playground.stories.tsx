import type { Meta, StoryObj } from "@storybook/react";
import ApiPlayground from "./ApiPlayground";

const meta: Meta<typeof ApiPlayground> = {
  title: "API/Playground",
  component: ApiPlayground,
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

export const Default: StoryObj<typeof ApiPlayground> = {};
