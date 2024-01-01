import { Listr } from 'listr2'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'
import { getConfig } from '@redwoodjs/project-config'
import { errorTelemetry } from '@redwoodjs/telemetry'

import { transformTSToJS, writeFilesTask } from '../../../lib'
import c from '../../../lib/colors'
import { prepareForRollback } from '../../../lib/rollback'
import { templateForComponentFile, validateName } from '../helpers'

const REDWOOD_WEB_PATH_NAME = 'components'

export const files = ({ name, typescript = false, ...options }) => {
  const extension = typescript ? '.tsx' : '.jsx'
  const componentFile = templateForComponentFile({
    name,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    extension,
    generator: 'component',
    templatePath: 'component.tsx.template',
  })
  const testFile = templateForComponentFile({
    name,
    extension: `.test${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'component',
    templatePath: 'test.tsx.template',
  })
  const storiesFile = templateForComponentFile({
    name,
    extension: `.stories${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'component',
    // Using two different template files here because we have a TS-specific
    // information in a comment in the .tsx template
    templatePath: typescript ? 'stories.tsx.template' : 'stories.jsx.template',
  })

  const files = [componentFile]
  if (options.stories) {
    files.push(storiesFile)
  }

  if (options.tests) {
    files.push(testFile)
  }

  // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }
  return files.reduce((acc, [outputPath, content]) => {
    const template = typescript ? content : transformTSToJS(outputPath, content)

    return {
      [outputPath]: template,
      ...acc,
    }
  }, {})
}

export async function handler(options) {
  recordTelemetryAttributes({
    command: 'generate component',
    tests: options.tests,
    stories: options.stories,
    verbose: options.verbose,
    rollback: options.rollback,
    force: options.force,
    // TODO: This does not cover the specific options that each generator might pass in
  })

  if (options.tests === undefined) {
    options.tests = getConfig().generate.tests
  }
  if (options.stories === undefined) {
    options.stories = getConfig().generate.stories
  }
  validateName(options.name)

  try {
    const tasks = new Listr(
      [
        {
          title: `Generating component files...`,
          task: async () => {
            const f = await files(options)
            return writeFilesTask(f, { overwriteExisting: options.force })
          },
        },
      ],
      {
        rendererOptions: { collapseSubtasks: false },
        exitOnError: true,
        renderer: options.verbose && 'verbose',
      }
    )

    if (options.rollback && !options.force) {
      prepareForRollback(tasks)
    }
    await tasks.run()
  } catch (e) {
    errorTelemetry(process.argv, e.message)
    console.error(c.error(e.message))
    process.exit(e?.exitCode || 1)
  }
}
