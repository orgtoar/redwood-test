import { Listr } from 'listr2'
import pascalcase from 'pascalcase'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'
import { generate as generateTypes } from '@redwoodjs/internal/dist/generate/generate'
import { getConfig } from '@redwoodjs/project-config'
import { errorTelemetry } from '@redwoodjs/telemetry'

import { nameVariants, transformTSToJS, writeFilesTask } from '../../../lib'
import { isWordPluralizable } from '../../../lib/pluralHelpers'
import {
  addFunctionToRollback,
  prepareForRollback,
} from '../../../lib/rollback'
import { isPlural, singularize } from '../../../lib/rwPluralize'
import { getSchema } from '../../../lib/schemaHelpers'
import {
  templateForComponentFile,
  forcePluralizeWord,
  removeGeneratorName,
} from '../helpers'

import {
  checkProjectForQueryField,
  getIdName,
  getIdType,
  operationNameIsUnique,
  uniqueOperationName,
} from './utils/utils'

const COMPONENT_SUFFIX = 'Cell'
const REDWOOD_WEB_PATH_NAME = 'components'

export const files = async ({ name, typescript, ...options }) => {
  let cellName = removeGeneratorName(name, 'cell')
  let idName = 'id'
  let idType,
    mockIdValues = [42, 43, 44],
    model = null
  let templateNameSuffix = ''

  // Create a unique operation name.

  const shouldGenerateList =
    (isWordPluralizable(cellName) ? isPlural(cellName) : options.list) ||
    options.list

  // needed for the singular cell GQL query find by id case
  try {
    model = await getSchema(pascalcase(singularize(cellName)))
    idName = getIdName(model)
    idType = getIdType(model)
    mockIdValues =
      idType === 'String'
        ? mockIdValues.map((value) => `'${value}'`)
        : mockIdValues
  } catch {
    // Eat error so that the destroy cell generator doesn't raise an error
    // when trying to find prisma query engine in test runs.

    // Assume id will be Int, otherwise generated cell will keep throwing
    idType = 'Int'
  }

  if (shouldGenerateList) {
    cellName = forcePluralizeWord(cellName)
    templateNameSuffix = 'List'
    // override operationName so that its find_operationName
  }

  let operationName = options.query
  if (operationName) {
    const userSpecifiedOperationNameIsUnique = await operationNameIsUnique(
      operationName
    )
    if (!userSpecifiedOperationNameIsUnique) {
      throw new Error(`Specified query name: "${operationName}" is not unique!`)
    }
  } else {
    operationName = await uniqueOperationName(cellName, {
      list: shouldGenerateList,
    })
  }

  const extension = typescript ? '.tsx' : '.jsx'
  const cellFile = templateForComponentFile({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: `cell${templateNameSuffix}.tsx.template`,
    templateVars: {
      operationName,
      idName,
      idType,
    },
  })

  const testFile = templateForComponentFile({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension: `.test${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: 'test.js.template',
  })

  const storiesFile = templateForComponentFile({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension: `.stories${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: 'stories.tsx.template',
  })

  const mockFile = templateForComponentFile({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension: typescript ? '.mock.ts' : '.mock.js',
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: `mock${templateNameSuffix}.js.template`,
    templateVars: {
      idName,
      mockIdValues,
    },
  })

  const files = [cellFile]

  if (options.stories) {
    files.push(storiesFile)
  }

  if (options.tests) {
    files.push(testFile)
  }

  if (options.stories || options.tests) {
    files.push(mockFile)
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
    command: `generate cell`,
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
          title: `Generating cell files...`,
          task: async () => {
            const f = await files(options)
            return writeFilesTask(f, { overwriteExisting: options.force })
          },
        },
        {
          title: `Generating types ...`,
          task: async (_ctx, task) => {
            const queryFieldName = nameVariants(
              removeGeneratorName(options.name, 'cell')
            ).camelName
            const projectHasSdl = await checkProjectForQueryField(
              queryFieldName
            )

            if (projectHasSdl) {
              const { errors } = await generateTypes()

              for (const { message, error } of errors) {
                console.error(message)
                console.log()
                console.error(error)
                console.log()
              }

              addFunctionToRollback(generateTypes, true)
            } else {
              task.skip(
                `Skipping type generation: no SDL defined for "${queryFieldName}". To generate types, run 'yarn rw g sdl ${queryFieldName}'.`
              )
            }
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

export const validateName = (name) => {
  if (name.match(/^\W/)) {
    throw new Error(
      'The <name> argument must start with a letter, number or underscore.'
    )
  }
}
