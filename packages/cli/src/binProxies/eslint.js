import { createRequire } from 'module'

const requireFromESLint = createRequire(
  import.meta.resolve('eslint/package.json')
)

const bins = requireFromESLint('./package.json')['bin']

requireFromESLint(bins['eslint'])
