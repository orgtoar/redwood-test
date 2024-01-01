import { Listr } from 'listr2'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'
import { getConfig } from '@redwoodjs/project-config'
import { errorTelemetry } from '@redwoodjs/telemetry'

import { transformTSToJS, writeFilesTask } from '../../../lib'
import c from '../../../lib/colors'
import { prepareForRollback } from '../../../lib/rollback'
import {
  templateForComponentFile,
  removeGeneratorName,
  validateName,
} from '../helpers'

const COMPONENT_SUFFIX = 'Layout'
const REDWOOD_WEB_PATH_NAME = 'layouts'

export const files = ({ name, typescript = false, ...options }) => {
  const layoutName = removeGeneratorName(name, 'layout')
  const extension = typescript ? '.tsx' : '.jsx'
  const layoutFile = templateForComponentFile({
    name: layoutName,
    suffix: COMPONENT_SUFFIX,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    extension,
    generator: 'layout',
    templatePath: options.skipLink
      ? 'layout.tsx.a11yTemplate'
      : 'layout.tsx.template',
  })
  const testFile = templateForComponentFile({
    name: layoutName,
    suffix: COMPONENT_SUFFIX,
    extension: `.test${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'layout',
    templatePath: 'test.tsx.template',
  })
  const storyFile = templateForComponentFile({
    name: layoutName,
    suffix: COMPONENT_SUFFIX,
    extension: `.stories${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'layout',
    templatePath: 'stories.tsx.template',
  })

  const files = [layoutFile]
  if (options.stories) {
    files.push(storyFile)
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
    command: 'generate layout',
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
          title: 'Generating layout files...',
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
