import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { E2ETestDashboard } from './E2ETestDashboard';

const meta = {
  title: 'Testing/E2E Test Dashboard',
  component: E2ETestDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'End-to-end test execution dashboard showing test results, metrics, trends, and detailed test run information.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof E2ETestDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const AllTestsPassing: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showing all E2E tests passing with 100% success rate.',
      },
    },
  },
};

export const WithFailures: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showing some test failures requiring investigation and fixes.',
      },
    },
  },
};

export const InProgress: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Live view of tests currently executing with real-time updates.',
      },
    },
  },
};

// Import necessary testing utilities (Storybook v8)
import { within, userEvent, expect } from '@storybook/test';

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check main dashboard elements
    await expect(canvas.getByText('E2E Test Dashboard')).toBeInTheDocument();

    // Check test suites are displayed
    await expect(canvas.getByText(/Auth Flow/i)).toBeInTheDocument();
    await expect(canvas.getByText(/Quiz Flow/i)).toBeInTheDocument();
    await expect(canvas.getByText(/User Journey/i)).toBeInTheDocument();

    // Check metrics are visible
    const passRate = canvas.getByText(/Pass Rate/i);
    expect(passRate).toBeInTheDocument();

    const avgDuration = canvas.getByText(/Avg Duration/i);
    expect(avgDuration).toBeInTheDocument();

    // Interact with a test suite
    const authFlow = canvas.getByText(/Auth Flow/i);
    await userEvent.click(authFlow);
  },
};

export const HistoricalTrends: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Shows test execution trends over the last 30 days with pass/fail rates and performance metrics.',
      },
    },
  },
};

export const DetailedResults: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Detailed view of individual test results with stack traces, screenshots, and debugging information.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click on a failed test to see details
    const failedTest = await canvas.findByText(/Failed/i);
    await userEvent.click(failedTest);

    // Check that details are shown
    await expect(canvas.getByText(/Stack Trace/i)).toBeInTheDocument();
  },
};

export const CIIntegration: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Dashboard integrated with CI/CD pipeline showing test results from latest builds.',
      },
    },
  },
};
