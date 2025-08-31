import type { TestRunnerConfig } from '@storybook/test-runner';
import AxeBuilder from '@axe-core/playwright';

const A11Y_INCLUDE = [
  /Docs\/00 Start Here/i,
  /API\/Playground/i,
  /Docs\/Quick Index/i,
  /Docs\/Repo Docs Browser/i,
  /Docs\/Epics\/Epic Manager/i,
];

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    // Only run a11y on selected stories to keep runtime down
    const title = context.title || '';
    const shouldCheck = A11Y_INCLUDE.some((re) => re.test(title));
    if (!shouldCheck) return;
    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // relax if theme tokens make false positives
      .analyze();
    expect(results.violations).toEqual([]);
  },
};

export default config;
