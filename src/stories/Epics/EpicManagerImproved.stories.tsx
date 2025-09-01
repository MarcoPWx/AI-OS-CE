import type { Meta, StoryObj } from "@storybook/react";
import EpicManager from "./EpicManager";

const meta: Meta<typeof EpicManager> = {
  title: "Epics/Epic Manager (Improved)",
  component: EpicManager,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f8fafc" },
        { name: "dark", value: "#0f172a" },
      ],
    },
    docs: {
      description: {
        component:
          "A comprehensive epic management dashboard for tracking project progress, priorities, and team assignments.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultFilter: {
      control: "select",
      options: ["all", "planning", "in-progress", "review", "completed"],
      description: "Default filter for epic status",
      defaultValue: "all",
    },
    defaultSort: {
      control: "select",
      options: ["priority", "dueDate", "progress"],
      description: "Default sorting method",
      defaultValue: "priority",
    },
    showStats: {
      control: "boolean",
      description: "Show summary statistics panel",
      defaultValue: true,
    },
    maxEpics: {
      control: { type: "range", min: 1, max: 20, step: 1 },
      description: "Maximum number of epics to display",
      defaultValue: 10,
    },
    theme: {
      control: "radio",
      options: ["light", "dark", "auto"],
      description: "UI theme preference",
      defaultValue: "light",
    },
  },
};
export default meta;

export const Default: StoryObj<typeof EpicManager> = {
  args: {
    defaultFilter: "all",
    defaultSort: "priority",
    showStats: true,
    maxEpics: 10,
    theme: "light",
  },
};

export const InProgress: StoryObj<typeof EpicManager> = {
  args: {
    defaultFilter: "in-progress",
    defaultSort: "progress",
    showStats: true,
    maxEpics: 10,
    theme: "light",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows only epics that are currently in progress, sorted by completion percentage.",
      },
    },
  },
};

export const HighPriority: StoryObj<typeof EpicManager> = {
  args: {
    defaultFilter: "all",
    defaultSort: "priority",
    showStats: true,
    maxEpics: 5,
    theme: "light",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Displays top priority epics with limited view for focused attention.",
      },
    },
  },
};

export const DarkMode: StoryObj<typeof EpicManager> = {
  args: {
    defaultFilter: "all",
    defaultSort: "dueDate",
    showStats: true,
    maxEpics: 10,
    theme: "dark",
  },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story: "Epic Manager in dark mode theme, sorted by due date.",
      },
    },
  },
};

export const CompactView: StoryObj<typeof EpicManager> = {
  args: {
    defaultFilter: "all",
    defaultSort: "priority",
    showStats: false,
    maxEpics: 15,
    theme: "light",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Compact view without statistics panel, showing more epics at once.",
      },
    },
  },
};
