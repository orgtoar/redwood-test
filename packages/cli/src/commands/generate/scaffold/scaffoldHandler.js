import path from 'path'

import camelcase from 'camelcase'
import execa from 'execa'
import fs from 'fs-extra'
import humanize from 'humanize-string'
import { Listr } from 'listr2'
import { paramCase } from 'param-case'
import pascalcase from 'pascalcase'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'
import { generate as generateTypes } from '@redwoodjs/internal/dist/generate/generate'
import { getConfig } from '@redwoodjs/project-config'

import {
  generateTemplate,
  readFile,
  writeFile,
  asyncForEach,
  getDefaultArgs,
  getPaths,
  writeFilesTask,
  addRoutesToRouterTask,
  addScaffoldImport,
  transformTSToJS,
  nameVariants,
} from '../../../lib'
import c from '../../../lib/colors'
import {
  prepareForRollback,
  addFunctionToRollback,
} from '../../../lib/rollback'
import { pluralize, singularize } from '../../../lib/rwPluralize'
import { getSchema, verifyModelName } from '../../../lib/schemaHelpers'
import {
  customOrDefaultTemplatePath,
  relationsForModel,
  intForeignKeysForModel,
  mapPrismaScalarToPagePropTsType,
} from '../helpers'
import { builder as sdlBuilder } from '../sdl/sdl'
import { files as sdlFiles } from '../sdl/sdlHandler'
import { builder as serviceBuilder } from '../service/service'
import { files as serviceFiles } from '../service/serviceHandler'

// note a better way to do this is in https://github.com/redwoodjs/redwood/pull/3783/files
const NON_EDITABLE_COLUMNS = ['id', 'createdAt', 'updatedAt']
// Any assets that should not trigger an overwrite error and require a --force
const SKIPPABLE_ASSETS = ['scaffold.css']
const PACKAGE_SET = 'Set'

const getIdType = (model) => {
  return model.fields.find((field) => field.isId)?.type
}

const getIdName = (model) => {
  return model.fields.find((field) => field.isId)?.name
}

const filterAutoGeneratedColumnsForScaffold = (column) => {
  const autoGeneratedFunctions = ['now', 'autoincrement']
  return !(
    column.isId ||
    column.isUpdatedAt ||
    autoGeneratedFunctions.includes(column?.default?.name)
  )
}

const getImportComponentNames = (
  name,
  scaffoldPath,
  nestScaffoldByModel = true
) => {
  const pluralName = pascalcase(pluralize(name))
  const singularName = pascalcase(singularize(name))
  let componentPath
  if (scaffoldPath === '') {
    componentPath = nestScaffoldByModel
      ? `src/components/${singularName}`
      : `src/components`
  } else {
    const sP = scaffoldPath.split('/').map(pascalcase).join('/')
    componentPath = nestScaffoldByModel
      ? `src/components/${sP}/${singularName}`
      : `src/components/${sP}`
  }

  return {
    importComponentName: `${componentPath}/${singularName}`,
    importComponentNameCell: `${componentPath}/${singularName}Cell`,
    importComponentEditNameCell: `${componentPath}/Edit${singularName}Cell`,
    importComponentNameForm: `${componentPath}/${singularName}Form`,
    importComponentNewName: `${componentPath}/New${singularName}`,
    importComponentNames: `${componentPath}/${pluralName}`,
    importComponentNamesCell: `${componentPath}/${pluralName}Cell`,
    importLayoutNames: `src/layouts/ScaffoldLayout`,
  }
}

// Includes imports from getImportComponentNames()
const getTemplateStrings = (name, scaffoldPath, nestScaffoldByModel = true) => {
  const nameVars = nameVariants(name)
  const camelScaffoldPath = camelcase(pascalcase(scaffoldPath))

  return {
    pluralRouteName:
      scaffoldPath === ''
        ? nameVars.pluralCamelName
        : `${camelScaffoldPath}${nameVars.pluralPascalName}`,

    editRouteName:
      scaffoldPath === ''
        ? `edit${nameVars.singularPascalName}`
        : `${camelScaffoldPath}Edit${nameVars.singularPascalName}`,

    singularRouteName:
      scaffoldPath === ''
        ? nameVars.singularCamelName
        : `${camelScaffoldPath}${nameVars.singularPascalName}`,

    newRouteName:
      scaffoldPath === ''
        ? `new${nameVars.singularPascalName}`
        : `${camelScaffoldPath}New${nameVars.singularPascalName}`,
    ...getImportComponentNames(name, scaffoldPath, nestScaffoldByModel),
  }
}

// Checks whether Tailwind is installed, and if the `flag` argument is not
// already set, returns true. Otherwise just returns `flag`
export const shouldUseTailwindCSS = (flag) => {
  if (flag === undefined) {
    return fs.existsSync(path.join(getPaths().web.config, 'tailwind.config.js'))
  } else {
    return flag
  }
}

export const files = async ({
  docs,
  model: name,
  path: scaffoldPath = '',
  tests = true,
  typescript = false,
  tailwind = false,
  force = false,
  nestScaffoldByModel,
}) => {
  const model = await getSchema(name)
  if (typeof nestScaffoldByModel === 'undefined') {
    nestScaffoldByModel = getConfig().generate.nestScaffoldByModel
  }
  const templateStrings = getTemplateStrings(
    name,
    scaffoldPath,
    nestScaffoldByModel
  )
  const pascalScaffoldPath =
    scaffoldPath === ''
      ? scaffoldPath
      : scaffoldPath.split('/').map(pascalcase).join('/') + '/'

  return {
    ...(await componentFiles(
      name,
      pascalScaffoldPath,
      typescript,
      nestScaffoldByModel,
      templateStrings
    )),
    ...(await sdlFiles({
      ...getDefaultArgs(sdlBuilder),
      docs,
      name,
      typescript,
    })),
    ...(await serviceFiles({
      ...getDefaultArgs(serviceBuilder),
      name,
      crud: true,
      relations: relationsForModel(model),
      tests,
      typescript,
    })),
    ...assetFiles(name, tailwind),
    ...(await formatters(name, typescript)),
    ...layoutFiles(name, force, typescript, templateStrings),
    ...(await pageFiles(
      name,
      pascalScaffoldPath,
      typescript,
      nestScaffoldByModel,
      templateStrings
    )),
  }
}

const assetFiles = (name, tailwind) => {
  let fileList = {}
  const assets = fs.readdirSync(
    customOrDefaultTemplatePath({
      side: 'web',
      generator: 'scaffold',
      templatePath: 'assets',
    })
  )

  assets.forEach((asset) => {
    // check if the asset name matches the Tailwind preference
    if (
      (tailwind && asset.match(/tailwind/)) ||
      (!tailwind && !asset.match(/tailwind/))
    ) {
      const outputAssetName = asset
        .replace(/\.template/, '')
        .replace(/\.tailwind/, '')
      const outputPath = path.join(getPaths().web.src, outputAssetName)

      // skip assets that already exist on disk, never worry about overwriting
      if (
        !SKIPPABLE_ASSETS.includes(path.basename(outputPath)) ||
        !fs.existsSync(outputPath)
      ) {
        const template = generateTemplate(
          customOrDefaultTemplatePath({
            side: 'web',
            generator: 'scaffold',
            templatePath: path.join('assets', asset),
          }),
          {
            name,
          }
        )
        fileList[outputPath] = template
      }
    }
  })

  return fileList
}

const formatters = async (name, isTypescript) => {
  const outputPath = path.join(
    getPaths().web.src,
    'lib',
    isTypescript ? 'formatters.tsx' : 'formatters.jsx'
  )
  const outputPathTest = path.join(
    getPaths().web.src,
    'lib',
    isTypescript ? 'formatters.test.tsx' : 'formatters.test.jsx'
  )

  // skip files that already exist on disk, never worry about overwriting
  if (fs.existsSync(outputPath)) {
    return
  }

  const template = generateTemplate(
    customOrDefaultTemplatePath({
      side: 'web',
      generator: 'scaffold',
      templatePath: path.join('lib', 'formatters.tsx.template'),
    }),
    {
      name,
    }
  )

  const templateTest = generateTemplate(
    customOrDefaultTemplatePath({
      side: 'web',
      generator: 'scaffold',
      templatePath: path.join('lib', 'formatters.test.tsx.template'),
    }),
    {
      name,
    }
  )

  return {
    [outputPath]: isTypescript
      ? template
      : transformTSToJS(outputPath, template),
    [outputPathTest]: isTypescript
      ? templateTest
      : transformTSToJS(outputPathTest, templateTest),
  }
}

const modelRelatedVariables = (model) => {
  const componentMetadata = {
    Enum: {
      componentName: 'RadioField',
      defaultProp: 'defaultChecked',
      validation: () => false,
      listDisplayFunction: 'formatEnum',
      displayFunction: 'formatEnum',
    },
    EnumList: {
      componentName: 'CheckboxField',
      defaultProp: 'defaultChecked',
      validation: () => false,
      listDisplayFunction: 'formatEnum',
      displayFunction: 'formatEnum',
    },
    Boolean: {
      componentName: 'CheckboxField',
      defaultProp: 'defaultChecked',
      validation: () => false,
      listDisplayFunction: 'checkboxInputTag',
      displayFunction: 'checkboxInputTag',
    },
    DateTime: {
      componentName: 'DatetimeLocalField',
      deserializeFunction: 'formatDatetime',
      listDisplayFunction: 'timeTag',
      displayFunction: 'timeTag',
    },
    Int: {
      componentName: 'NumberField',
    },
    Json: {
      componentName: 'TextAreaField',
      validation: (isRequired) =>
        `{{ valueAsJSON: true${isRequired ? ', required: true' : ''} }}`,
      displayFunction: 'jsonDisplay',
      listDisplayFunction: 'jsonTruncate',
      deserializeFunction: 'JSON.stringify',
    },
    Float: {
      validation: (isRequired) =>
        `{{ valueAsNumber: true${isRequired ? ', required: true' : ''} }}`,
    },
    Decimal: {
      validation: (isRequired) =>
        `{{ valueAsNumber: true${isRequired ? ', required: true' : ''} }}`,
    },
    default: {
      componentName: 'TextField',
      defaultProp: 'defaultValue',
      deserializeFunction: '',
      validation: '{{ required: true }}',
      displayFunction: undefined,
      listDisplayFunction: 'truncate',
    },
  }

  const relations = relationsForModel(model).map((relation) => relation)

  const columns = model.fields
    .filter((field) => field.kind !== 'object')
    .map((column) => {
      let validation

      if (componentMetadata[column.type]?.validation) {
        validation = componentMetadata[column.type]?.validation(
          column?.isRequired
        )
      } else {
        validation = column?.isRequired
          ? componentMetadata.default.validation
          : null
      }

      const isRelationalField =
        column.name.endsWith('Id') &&
        relations.some((relation) => column.name.includes(relation))
      const isRequired = column.isRequired
      const isEnum = column.kind === 'enum'
      const isList = column.isList
      const enumType = isEnum && isList ? 'EnumList' : 'Enum'
      const metadataKey = isEnum ? enumType : column.type

      return {
        ...column,
        label: humanize(column.name),
        component:
          componentMetadata[metadataKey]?.componentName ||
          componentMetadata.default.componentName,
        defaultProp:
          componentMetadata[metadataKey]?.defaultProp ||
          componentMetadata.default.defaultProp,
        deserializeFunction:
          componentMetadata[metadataKey]?.deserializeFunction ||
          componentMetadata.default.deserializeFunction,
        validation,
        listDisplayFunction:
          componentMetadata[metadataKey]?.listDisplayFunction ||
          componentMetadata.default.listDisplayFunction,
        displayFunction:
          componentMetadata[metadataKey]?.displayFunction ||
          componentMetadata.default.displayFunction,
        values: column.enumValues || [],
        isList,
        isEnum,
        isRequired,
        isRelationalField,
      }
    })
  const editableColumns = columns
    .filter((column) => {
      return NON_EDITABLE_COLUMNS.indexOf(column.name) === -1
    })
    .filter(filterAutoGeneratedColumnsForScaffold)
  const fieldsToImport = Object.keys(
    editableColumns.reduce((accumulator, column) => {
      accumulator[column.component] = true
      return accumulator
    }, {})
  )

  if (!fieldsToImport.length) {
    throw new Error(`There are no editable fields in the ${model.name} model`)
  }

  const formattersImports = columns
    .map((column) => column.displayFunction)
    .sort()
    // filter out duplicates, so we only keep unique import names
    .filter((name, index, array) => array.indexOf(name) === index)
    .join(', ')

  const listFormattersImports = columns
    .map((column) => column.listDisplayFunction)
    .sort()
    // filter out duplicates, so we only keep unique import names
    .filter((name, index, array) => array.indexOf(name) === index)
    .join(', ')

  return {
    columns,
    fieldsToImport,
    editableColumns,
    listFormattersImports,
    formattersImports,
  }
}

const layoutFiles = (name, force, generateTypescript, templateStrings) => {
  let fileList = {}

  const layouts = fs.readdirSync(
    customOrDefaultTemplatePath({
      side: 'web',
      generator: 'scaffold',
      templatePath: 'layouts',
    })
  )

  layouts.forEach((layout) => {
    const outputLayoutName = layout.replace(
      /\.tsx\.template/,
      generateTypescript ? '.tsx' : '.jsx'
    )

    const outputPath = path.join(
      getPaths().web.layouts,
      'ScaffoldLayout',
      outputLayoutName
    )

    // Since the ScaffoldLayout is shared, don't overwrite by default
    if (!fs.existsSync(outputPath) || force) {
      const template = generateTemplate(
        customOrDefaultTemplatePath({
          side: 'web',
          generator: 'scaffold',
          templatePath: path.join('layouts', layout),
        }),
        {
          name,
          pascalScaffoldPath: '',
          ...templateStrings,
        }
      )

      fileList[outputPath] = generateTypescript
        ? template
        : transformTSToJS(outputPath, template)
    }
  })

  return fileList
}

const pageFiles = async (
  name,
  pascalScaffoldPath = '',
  generateTypescript,
  nestScaffoldByModel = true,
  templateStrings
) => {
  const pluralName = pascalcase(pluralize(name))
  const singularName = pascalcase(singularize(name))
  const model = await getSchema(singularName)
  const idType = getIdType(model)
  const idTsType = mapPrismaScalarToPagePropTsType(idType)
  const idName = getIdName(model)

  let fileList = {}

  const pages = fs.readdirSync(
    customOrDefaultTemplatePath({
      side: 'web',
      generator: 'scaffold',
      templatePath: 'pages',
    })
  )

  pages.forEach((page) => {
    // Sanitize page names
    const outputPageName = page
      .replace(/Names/, pluralName)
      .replace(/Name/, singularName)
      .replace(/\.tsx\.template/, generateTypescript ? '.tsx' : '.jsx')

    const finalFolder =
      (nestScaffoldByModel ? singularName + '/' : '') +
      outputPageName.replace(/\.[jt]sx?/, '')

    const outputPath = path.join(
      getPaths().web.pages,
      pascalScaffoldPath,
      finalFolder,
      outputPageName
    )
    const template = generateTemplate(
      customOrDefaultTemplatePath({
        side: 'web',
        generator: 'scaffold',
        templatePath: path.join('pages', page),
      }),
      {
        idTsType,
        idName,
        name,
        pascalScaffoldPath,
        ...templateStrings,
        ...modelRelatedVariables(model),
      }
    )

    fileList[outputPath] = generateTypescript
      ? template
      : transformTSToJS(outputPath, template)
  })

  return fileList
}

const componentFiles = async (
  name,
  pascalScaffoldPath = '',
  generateTypescript,
  nestScaffoldByModel = true,
  templateStrings
) => {
  const pluralName = pascalcase(pluralize(name))
  const singularName = pascalcase(singularize(name))
  const model = await getSchema(singularName)
  const idType = getIdType(model)
  const idName = getIdName(model)
  const pascalIdName = pascalcase(idName)
  const intForeignKeys = intForeignKeysForModel(model)
  let fileList = {}

  const components = fs.readdirSync(
    customOrDefaultTemplatePath({
      side: 'web',
      generator: 'scaffold',
      templatePath: 'components',
    })
  )

  await asyncForEach(components, (component) => {
    const outputComponentName = component
      .replace(/Names/, pluralName)
      .replace(/Name/, singularName)
      .replace(/\.tsx\.template/, generateTypescript ? '.tsx' : '.jsx')

    const finalFolder =
      (nestScaffoldByModel ? singularName + '/' : '') +
      outputComponentName.replace(/\.[jt]sx?/, '')

    const outputPath = path.join(
      getPaths().web.components,
      pascalScaffoldPath,
      finalFolder,
      outputComponentName
    )

    const template = generateTemplate(
      customOrDefaultTemplatePath({
        side: 'web',
        generator: 'scaffold',
        templatePath: path.join('components', component),
      }),
      {
        name,
        idType,
        idName,
        pascalIdName,
        intForeignKeys,
        pascalScaffoldPath,
        ...templateStrings,
        ...modelRelatedVariables(model),
      }
    )

    fileList[outputPath] = generateTypescript
      ? template
      : transformTSToJS(outputPath, template)
  })

  return fileList
}

// add routes for all pages
export const routes = async ({
  model: name,
  path: scaffoldPath = '',
  nestScaffoldByModel,
}) => {
  if (typeof nestScaffoldByModel === 'undefined') {
    nestScaffoldByModel = getConfig().generate.nestScaffoldByModel
  }

  const templateNames = getTemplateStrings(name, scaffoldPath)
  const nameVars = nameVariants(name)
  const model = await getSchema(nameVars.singularPascalName)
  const idRouteParam = getIdType(model) === 'Int' ? ':Int' : ''
  const idName = getIdName(model)

  const paramScaffoldPath =
    scaffoldPath === ''
      ? scaffoldPath
      : scaffoldPath.split('/').map(paramCase).join('/') + '/'
  const pascalScaffoldPath = pascalcase(scaffoldPath)

  const pageRoot =
    pascalScaffoldPath +
    (nestScaffoldByModel ? nameVars.singularPascalName : '')

  return [
    // new
    `<Route path="/${paramScaffoldPath}${nameVars.pluralParamName}/new" page={${pageRoot}New${nameVars.singularPascalName}Page} name="${templateNames.newRouteName}" />`,
    // edit
    `<Route path="/${paramScaffoldPath}${nameVars.pluralParamName}/{${idName}${idRouteParam}}/edit" page={${pageRoot}Edit${nameVars.singularPascalName}Page} name="${templateNames.editRouteName}" />`,
    // singular
    `<Route path="/${paramScaffoldPath}${nameVars.pluralParamName}/{${idName}${idRouteParam}}" page={${pageRoot}${nameVars.singularPascalName}Page} name="${templateNames.singularRouteName}" />`,
    // plural
    `<Route path="/${paramScaffoldPath}${nameVars.pluralParamName}" page={${pageRoot}${nameVars.pluralPascalName}Page} name="${templateNames.pluralRouteName}" />`,
  ]
}

const addLayoutImport = () => {
  const importLayout = `import ScaffoldLayout from 'src/layouts/ScaffoldLayout'`
  const routesPath = getPaths().web.routes
  const routesContent = readFile(routesPath).toString()

  if (!routesContent.match(importLayout)) {
    const newRoutesContent = routesContent.replace(
      /['"]@redwoodjs\/router['"](\s*)/,
      `'@redwoodjs/router'\n\n${importLayout}$1`
    )
    writeFile(routesPath, newRoutesContent, { overwriteExisting: true })

    return 'Added layout import to Routes.{jsx,tsx}'
  } else {
    return 'Layout import already exists in Routes.{jsx,tsx}'
  }
}

const addHelperPackages = async (task) => {
  const packageJsonPath = path.join(getPaths().web.base, 'package.json')
  const packageJson = require(packageJsonPath)

  // Skip if humanize-string is already installed
  if (packageJson.dependencies['humanize-string']) {
    return task.skip('Skipping. Already installed')
  }

  // Has to be v2.1.0 because v3 switched to ESM module format, which we don't
  // support yet (2022-09-20)
  // TODO: Update to latest version when RW supports ESMs
  await execa('yarn', ['workspace', 'web', 'add', 'humanize-string@2.1.0'])
  addFunctionToRollback(async () => {
    await execa('yarn', ['workspace', 'web', 'remove', 'humanize-string'])
  })
}

const addSetImport = (task) => {
  const routesPath = getPaths().web.routes
  const routesContent = readFile(routesPath).toString()
  const [redwoodRouterImport, importStart, spacing, importContent, importEnd] =
    routesContent.match(
      /(import {)(\s*)([^]*)(} from ['"]@redwoodjs\/router['"])/
    ) || []

  if (!redwoodRouterImport) {
    task.skip(
      "Couldn't add Set import from @redwoodjs/router to Routes.{jsx,tsx}"
    )
    return undefined
  }

  const routerImports = importContent.replace(/\s/g, '').split(',')
  if (routerImports.includes(PACKAGE_SET)) {
    return 'Skipping Set import'
  }
  const newRoutesContent = routesContent.replace(
    redwoodRouterImport,
    importStart +
      spacing +
      PACKAGE_SET +
      `,` +
      spacing +
      importContent +
      importEnd
  )

  writeFile(routesPath, newRoutesContent, { overwriteExisting: true })

  return 'Added Set import to Routes.{jsx,tsx}'
}

const addScaffoldSetToRouter = async (model, path) => {
  const templateNames = getTemplateStrings(model, path)
  const nameVars = nameVariants(model)
  const title = nameVars.pluralPascalName
  const titleTo = templateNames.pluralRouteName
  const buttonLabel = `New ${nameVars.singularPascalName}`
  const buttonTo = templateNames.newRouteName

  return addRoutesToRouterTask(
    await routes({ model, path }),
    'ScaffoldLayout',
    { title, titleTo, buttonLabel, buttonTo }
  )
}

export const tasks = ({
  docs,
  model,
  path,
  force,
  tests,
  typescript,
  javascript,
  tailwind,
}) => {
  return new Listr(
    [
      {
        title: 'Generating scaffold files...',
        task: async () => {
          const f = await files({
            docs,
            model,
            path,
            tests,
            typescript,
            javascript,
            tailwind,
            force,
          })
          return writeFilesTask(f, { overwriteExisting: force })
        },
      },
      {
        title: 'Install helper packages',
        task: (_, task) => addHelperPackages(task),
      },
      {
        title: 'Adding layout import...',
        task: async () => addLayoutImport(),
      },
      {
        title: 'Adding set import...',
        task: async (_, task) => addSetImport(task),
      },
      {
        title: 'Adding scaffold routes...',
        task: async () => addScaffoldSetToRouter(model, path),
      },
      {
        title: 'Adding scaffold asset imports...',
        task: () => addScaffoldImport(),
      },
      {
        title: `Generating types ...`,
        task: async () => {
          const { errors } = await generateTypes()

          for (const { message, error } of errors) {
            console.error(message)
            console.log()
            console.error(error)
            console.log()
          }

          addFunctionToRollback(generateTypes, true)
        },
      },
    ],
    { rendererOptions: { collapseSubtasks: false }, exitOnError: true }
  )
}

export const handler = async ({
  model: modelArg,
  force,
  tests,
  typescript,
  tailwind,
  docs = false,
  rollback,
}) => {
  if (tests === undefined) {
    tests = getConfig().generate.tests
  }
  recordTelemetryAttributes({
    command: 'generate scaffold',
    force,
    tests,
    typescript,
    tailwind,
    docs,
    rollback,
  })

  const { model, path } = splitPathAndModel(modelArg)

  tailwind = shouldUseTailwindCSS(tailwind)

  try {
    const { name } = await verifyModelName({ name: model })
    const t = tasks({
      docs,
      model: name,
      path,
      force,
      tests,
      typescript,
      tailwind,
    })
    if (rollback && !force) {
      prepareForRollback(t)
    }
    await t.run()
  } catch (e) {
    console.log(c.error(e.message))
    process.exit(e?.existCode || 1)
  }
}

export const splitPathAndModel = (pathSlashModel) => {
  const path = pathSlashModel.split('/').slice(0, -1).join('/')
  // This code will work whether or not there's a path in model
  // E.g. if model is just 'post',
  // path.split('/') will return ['post'].
  const model = pathSlashModel.split('/').pop()

  return { model, path }
}
