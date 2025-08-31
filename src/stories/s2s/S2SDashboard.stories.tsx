import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { S2SDashboard } from './S2SDashboard';

const meta = {
  title: 'Dashboard/S2S Architecture',
  component: S2SDashboard,
  parameters: {
    layout: 'fullscreen',
    helpDocs: [
      { href: '?path=/story/labs-technology-overview-lab--page', title: 'Technology Overview Lab' },
    ],
    docs: {
      description: {
        component:
          'Service-to-Service architecture dashboard showing microservice health, communication patterns, and real-time events.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof S2SDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const AllHealthy: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'All services reporting healthy status with normal traffic patterns.',
      },
    },
  },
};

export const WithIssues: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Some services experiencing issues or degraded performance.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Simulate clicking on a service to see details
    const canvas = within(canvasElement);
    const authService = await canvas.findByText('auth-service');
    await userEvent.click(authService);
  },
};

export const HighTraffic: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'System under high load with increased request rates across all services.',
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

    // Check that all main services are visible
    await expect(canvas.getByText('auth-service')).toBeInTheDocument();
    await expect(canvas.getByText('api-gateway')).toBeInTheDocument();
    await expect(canvas.getByText('quiz-service')).toBeInTheDocument();

    // Check health indicators
    const healthyIndicators = canvas.getAllByText('Healthy');
    expect(healthyIndicators.length).toBeGreaterThan(0);

    // Check that events are being displayed
    const eventsSection = canvas.getByText('Recent Events');
    expect(eventsSection).toBeInTheDocument();
  },
};
