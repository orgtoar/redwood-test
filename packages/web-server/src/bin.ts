import path from 'path'

import { config } from 'dotenv-defaults'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { getPaths } from '@redwoodjs/project-config'

import { bin } from '../package.json'

import { description, builder } from './cliConfig'
import { serve } from './serve'

async function main() {
  // Use the name of the bin as the scriptName for yargs to keep these in sync.
  // Obviously the way it's written it depends on there being only one bin
  const [scriptName] = Object.keys(bin)

  yargs(hideBin(process.argv))
    .scriptName(scriptName)
    .strict()
    .command('$0', description, builder, async (argv) => {
      config({
        path: path.join(getPaths().base, '.env'),
        defaults: path.join(getPaths().base, '.env.defaults'),
        multiline: true,
      })

      try {
        await serve(argv)
      } catch (error) {
        process.exitCode ||= 1
        console.error((error as Error).message)
      }
    })
    .parse()
}

main()
