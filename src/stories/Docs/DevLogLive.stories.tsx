import type { Meta, StoryObj } from '@storybook/react'
import DevLogLive from './DevLogLive'

// Hidden legacy story: we keep a valid CSF default export to satisfy Storybook indexer
// but push it to the bottom of the sidebar.
const meta: Meta<typeof DevLogLive> = {
  title: 'ZZZ/Hidden/Dev Log (Live)',
  component: DevLogLive,
  parameters: {
    docs: { autodocs: false },
    options: { showPanel: false },
  },
}

export default meta

export const Hidden: StoryObj<typeof DevLogLive> = {}

