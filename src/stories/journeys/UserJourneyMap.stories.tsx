import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UserJourneyMap } from './UserJourneyMap';

const meta = {
  title: 'Analytics/User Journey Map',
  component: UserJourneyMap,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive user journey visualization showing user flows, drop-off points, conversion funnels, and session analytics.',
      },
    },
    helpDocs: [
      { href: '?path=/story/labs-technology-overview-lab--page', title: 'Technology Overview Lab' },
    ],
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UserJourneyMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const NewUserOnboarding: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Journey map focused on new user onboarding flow from landing to first quiz completion.',
      },
    },
  },
};

export const QuizCompletionFlow: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'User flow from quiz selection through completion and results sharing.',
      },
    },
  },
};

export const HighDropOffRate: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Scenario showing high drop-off rates at critical journey points for optimization analysis.',
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

    // Check main journey stages are visible
    await expect(canvas.getByText('Landing')).toBeInTheDocument();
    await expect(canvas.getByText('Registration')).toBeInTheDocument();
    await expect(canvas.getByText('Dashboard')).toBeInTheDocument();

    // Check metrics are displayed
    const conversionRate = canvas.getByText(/Conversion Rate/i);
    expect(conversionRate).toBeInTheDocument();

    // Check drop-off indicators
    const dropOffElements = canvas.getAllByText(/drop-off/i);
    expect(dropOffElements.length).toBeGreaterThan(0);

    // Interact with a journey stage
    const registrationStage = canvas.getByText('Registration');
    await userEvent.click(registrationStage);
  },
};

export const MobileJourney: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Mobile-specific user journey with touch interactions and app-specific flows.',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const ReturnUserFlow: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Journey map for returning users showing shortened flows and direct navigation patterns.',
      },
    },
  },
};
