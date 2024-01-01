import path from 'path'

import fs from 'fs-extra'
import terminalLink from 'terminal-link'

import { getPaths } from '../../../lib'
import { getYargsDefaults } from '../helpers'

const TEMPLATE_PATH = path.resolve(__dirname, 'templates', 'script.js.template')
const TSCONFIG_TEMPLATE = path.resolve(
  __dirname,
  'templates',
  'tsconfig.json.template'
)

export const files = ({ name, typescript = false }) => {
  const outputFilename = `${name}.${typescript ? 'ts' : 'js'}`
  const outputPath = path.join(getPaths().scripts, outputFilename)

  const scriptTsConfigPath = path.join(getPaths().scripts, 'tsconfig.json')

  return {
    [outputPath]: fs.readFileSync(TEMPLATE_PATH, 'utf-8'),

    // Add tsconfig for type and cmd+click support if project is TS
    ...(typescript &&
      !fs.existsSync(scriptTsConfigPath) && {
        [scriptTsConfigPath]: fs.readFileSync(TSCONFIG_TEMPLATE, 'utf-8'),
      }),
  }
}

export const command = 'script <name>'
export const description = 'Generate a command line script'

export function builder(yargs) {
  yargs
    .positional('name', {
      description: 'A descriptor of what this script does',
      type: 'string',
    })
    .option('rollback', {
      description: 'Revert all generator actions if an error occurs',
      type: 'boolean',
      default: true,
    })
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#generate-script'
      )}`
    )

  Object.entries(getYargsDefaults()).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}

export async function handler(options) {
  const { handler } = await import('./scriptHandler.js')
  return handler(options)
}
