import type { Meta, StoryObj } from '@storybook/react'
import DevLogLive from './DevLogLive'

// Hidden legacy story: we keep a valid CSF default export to satisfy Storybook indexer
// but push it to the bottom of the sidebar.
const meta: Meta<typeof DevLogLive> = {
  title: 'Docs/Dev Log (Live)',
  component: DevLogLive,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
}

export default meta

export const Hidden: StoryObj<typeof DevLogLive> = {}

