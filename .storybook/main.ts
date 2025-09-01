import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(tsx|ts|jsx|js)", "../docs/**/*.mdx"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions", "msw-storybook-addon"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public", "../docs"],
  docs: { autodocs: "tag" },
  typescript: { reactDocgen: false },
};

export default config;
