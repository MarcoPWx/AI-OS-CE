import type { Meta, StoryObj } from "@storybook/react";
import ApiPlayground from "./ApiPlayground";

const meta: Meta<typeof ApiPlayground> = {
  title: "API/Playground",
  component: ApiPlayground,
};
export default meta;

export const Default: StoryObj<typeof ApiPlayground> = {};
