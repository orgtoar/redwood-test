import yargs from 'yargs'

import { isTypeScriptProject } from '../../../../../lib/project'
import { standardAuthBuilder, standardAuthHandler } from '../../setupHelpers'

export const command = 'auth custom'
export const description = 'Generate a custom auth configuration'
export const builder = (yargs: yargs.Argv) => {
  return standardAuthBuilder(yargs)
}

interface Args {
  rwVersion: string
  force: boolean
}

export const handler = async ({ rwVersion, force: forceArg }: Args) => {
  const authFilename = isTypeScriptProject() ? 'auth.ts' : 'auth.js'

  standardAuthHandler({
    rwVersion,
    forceArg,
    provider: 'custom',
    notes: [
      'Done! But you have a little more work to do:\n',
      'You will have to write the actual auth implementation/integration',
      `yourself. Take a look in ${authFilename} and do the changes necessary.`,
    ],
  })
}
