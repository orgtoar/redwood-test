import path from 'path'

import fs from 'fs-extra'
import { Listr } from 'listr2'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'
import { errorTelemetry } from '@redwoodjs/telemetry'

import { getPaths, writeFilesTask } from '../../../lib'
import c from '../../../lib/colors'
import { prepareForRollback } from '../../../lib/rollback'
import { validateName } from '../helpers'

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

export async function handler({ force, ...args }) {
  recordTelemetryAttributes({
    command: 'generate script',
    force,
    rollback: args.rollback,
  })

  const POST_RUN_INSTRUCTIONS = `Next steps...\n\n   ${c.warning(
    'After modifying your script, you can invoke it like:'
  )}

     yarn rw exec ${args.name}

     yarn rw exec ${args.name} --param1 true
`

  validateName(args.name)

  const tasks = new Listr(
    [
      {
        title: 'Generating script file...',
        task: () => {
          return writeFilesTask(files(args), { overwriteExisting: force })
        },
      },
      {
        title: 'Next steps...',
        task: (_ctx, task) => {
          task.title = POST_RUN_INSTRUCTIONS
        },
      },
    ].filter(Boolean),
    { rendererOptions: { collapseSubtasks: false } }
  )

  try {
    if (args.rollback && !force) {
      prepareForRollback(tasks)
    }
    await tasks.run()
  } catch (e) {
    errorTelemetry(process.argv, e.message)
    console.log(c.error(e.message))
    process.exit(1)
  }
}
