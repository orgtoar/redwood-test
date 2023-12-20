import { createRequire } from 'module'

const requireFromJest = createRequire(import.meta.resolve('jest/package.json'))

const bin = requireFromJest('./package.json')['bin']

requireFromJest(bin)
