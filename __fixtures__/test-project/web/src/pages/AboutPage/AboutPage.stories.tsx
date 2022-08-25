import type { ComponentMeta, ComponentStory } from '@storybook/react'

import AboutPage from './AboutPage'

export const generated: ComponentStory<typeof AboutPage> = (args) => {
  return <AboutPage {...args} />
}

export default {
  title: 'Pages/AboutPage',
  component: AboutPage,
} as ComponentMeta<typeof AboutPage>
