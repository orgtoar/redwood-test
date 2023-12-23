import path from 'path'

import fs from 'fs-extra'
import { Listr } from 'listr2'
import { paramCase } from 'param-case'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'

import { getPaths, writeFilesTask } from '../../../lib'
import c from '../../../lib/colors'
import { prepareForRollback } from '../../../lib/rollback'
import { validateName } from '../helpers'

const POST_RUN_INSTRUCTIONS = `Next steps...\n\n   ${c.warning(
  'After writing your migration, you can run it with:'
)}

     yarn rw dataMigrate up
`

const TEMPLATE_PATHS = {
  js: path.resolve(__dirname, 'templates', 'dataMigration.js.template'),
  ts: path.resolve(__dirname, 'templates', 'dataMigration.ts.template'),
}

export const files = ({ name, typescript }) => {
  const now = new Date().toISOString()
  const timestamp = now.split('.')[0].replace(/\D/g, '')
  const basename = `${timestamp}-${paramCase(name)}`
  const extension = typescript ? 'ts' : 'js'
  const outputFilename = basename + '.' + extension
  const outputPath = path.join(getPaths().api.dataMigrations, outputFilename)

  return {
    [outputPath]: fs.readFileSync(TEMPLATE_PATHS[extension]).toString(),
  }
}

export const handler = async (args) => {
  recordTelemetryAttributes({
    command: 'generate data-migration',
    force: args.force,
    rollback: args.rollback,
  })

  validateName(args.name)

  const tasks = new Listr(
    [
      {
        title: 'Generating data migration file...',
        task: () => {
          return writeFilesTask(files(args))
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
    if (args.rollback && !args.force) {
      prepareForRollback(tasks)
    }
    await tasks.run()
  } catch (e) {
    console.log(c.error(e.message))
    process.exit(1)
  }
}
