import type { Meta, StoryObj } from '@storybook/react'
import EpicManager from './EpicManager'

// Hidden baseline story: superseded by the improved version. Keep valid CSF to satisfy indexer.
const meta: Meta<typeof EpicManager> = {
  title: 'ZZZ/Hidden/Epic Manager (Baseline)',
  component: EpicManager,
  parameters: {
    docs: { autodocs: false },
    options: { showPanel: false },
  },
}

export default meta

export const Hidden: StoryObj<typeof EpicManager> = {}

