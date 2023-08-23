import path from 'path'

import { getApiSideBabelPlugins, prebuildApiFile } from './dist/index.js'

const RWJS_CWD = '/Users/dom/projects/redwood/test-project'
process.env.RWJS_CWD = RWJS_CWD

const apiFile = path.join(RWJS_CWD, 'api/src/lib/auth.ts')

const res = await prebuildApiFile(apiFile, 'abc.js')

console.log({
  res,
})
