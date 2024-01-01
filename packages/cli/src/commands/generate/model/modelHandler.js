import path from 'path'

import { Listr } from 'listr2'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'

import { getPaths, writeFilesTask, generateTemplate } from '../../../lib'
import c from '../../../lib/colors'
import { prepareForRollback } from '../../../lib/rollback'
import { verifyModelName } from '../../../lib/schemaHelpers'
import { validateName } from '../helpers'
const TEMPLATE_PATH = path.resolve(__dirname, 'templates', 'model.js.template')

export const files = ({ name, typescript = false }) => {
  const outputFilename = `${name}.${typescript ? 'ts' : 'js'}`
  const outputPath = path.join(getPaths().api.models, outputFilename)

  return {
    [outputPath]: generateTemplate(TEMPLATE_PATH, { name }),
  }
}

export const handler = async ({ force, ...args }) => {
  recordTelemetryAttributes({
    command: 'generate model',
    force,
    rollback: args.rollback,
  })

  validateName(args.name)

  const tasks = new Listr(
    [
      {
        title: 'Generating model file...',
        task: () => {
          return writeFilesTask(files(args), { overwriteExisting: force })
        },
      },
      {
        title: 'Parsing datamodel, generating api/src/models/index.js...',
        task: async () => {
          const redwoodRecordModule = await import('@redwoodjs/record')
          await redwoodRecordModule.default.parseDatamodel()
        },
      },
    ].filter(Boolean),
    { rendererOptions: { collapseSubtasks: false } }
  )

  try {
    await verifyModelName({ name: args.name })
    if (args.rollback && !force) {
      prepareForRollback(tasks)
    }
    await tasks.run()
  } catch (e) {
    console.log(c.error(e.message))
    process.exit(1)
  }
}
