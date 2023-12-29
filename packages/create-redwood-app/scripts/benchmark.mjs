/* eslint-env node */

import { cd, $ } from 'zx'

cd(process.env.PROJECT_PATH)

await $`hyperfine 'yarn create-redwood-app -y'`
