import type { Meta, StoryObj } from "@storybook/react";
import NetworkPlayground from "./NetworkPlayground";

const meta: Meta<typeof NetworkPlayground> = {
  title: "Dev/NetworkPlayground",
  component: NetworkPlayground,
};
export default meta;

export const Default: StoryObj<typeof NetworkPlayground> = {};
