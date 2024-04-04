#!/usr/bin/env node
import { createRequire } from 'module'

// We do not install storybook by default, so we need to check if it is
// installed before we try to run it.
try {
  const requireFromStorybook = createRequire(
    require.resolve('storybook-vite/package.json')
  )
  const bins = requireFromStorybook('./package.json')['bin']
  requireFromStorybook(bins['storybook-vite'])
} catch (error) {
  if ((error as any).code === 'MODULE_NOT_FOUND') {
    console.error('Storybook Vite is not currently installed.')
    process.exit(1)
  }
  throw error
}
