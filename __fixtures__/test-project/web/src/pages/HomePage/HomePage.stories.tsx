import type { ComponentMeta, ComponentStory } from '@storybook/react'

import HomePage from './HomePage'

export const generated: ComponentStory<typeof HomePage> = (args) => {
  return <HomePage {...args} />
}

export default {
  title: 'Pages/HomePage',
  component: HomePage,
} as ComponentMeta<typeof HomePage>
