import type { Meta, StoryObj } from "@storybook/react";
import PromptLibrary from "./PromptLibrary";

const meta: Meta<typeof PromptLibrary> = {
  title: "Resources/Prompt Library",
  component: PromptLibrary,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "A curated collection of battle-tested AI prompts for common development tasks.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

export const Default: StoryObj<typeof PromptLibrary> = {};
