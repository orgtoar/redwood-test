import path from 'path'

import fs from 'fs-extra'
import { Listr } from 'listr2'

import { addApiPackages } from '@redwoodjs/cli-helpers'
import { errorTelemetry } from '@redwoodjs/telemetry'

import { getPaths, transformTSToJS, writeFile } from '../../../lib'
import c from '../../../lib/colors'
import { isTypeScriptProject } from '../../../lib/project'

const { version } = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../../package.json'), 'utf-8')
)

export function setupServerFileTasks({ web = false, force = false } = {}) {
  return [
    {
      title: 'Adding the server file...',
      task: () => {
        const ts = isTypeScriptProject()

        const serverFilePath = path.join(
          getPaths().api.src,
          `server.${ts ? 'ts' : 'js'}`
        )

        const serverFileTemplateContent = fs.readFileSync(
          web
            ? path.join(__dirname, 'templates', 'server.withWeb.ts.template')
            : path.join(__dirname, 'templates', 'server.ts.template'),
          'utf-8'
        )

        const setupScriptContent = ts
          ? serverFileTemplateContent
          : transformTSToJS(serverFilePath, serverFileTemplateContent)

        return [
          writeFile(serverFilePath, setupScriptContent, {
            overwriteExisting: force,
          }),
        ]
      },
    },
    addApiPackages([`@redwoodjs/api-server@${version}`]),
  ]
}

export async function handler({ force, verbose }) {
  const tasks = new Listr(setupServerFileTasks({ force }), {
    rendererOptions: { collapseSubtasks: false, persistentOutput: true },
    renderer: verbose ? 'verbose' : 'default',
  })

  try {
    await tasks.run()
  } catch (e) {
    errorTelemetry(process.argv, e.message)
    console.error(c.error(e.message))
    process.exit(e?.exitCode || 1)
  }
}
