import camelcase from 'camelcase'
import terminalLink from 'terminal-link'

import { transformTSToJS } from '../../../lib'
import { pluralize, singularize } from '../../../lib/rwPluralize'
import { getSchema, verifyModelName } from '../../../lib/schemaHelpers'
import { yargsDefaults } from '../helpers'
import {
  createYargsForComponentGeneration,
  templateForComponentFile,
} from '../helpers'

const DEFAULT_SCENARIO_NAMES = ['one', 'two']

// parses the schema into scalar fields, relations and an array of foreign keys
export const parseSchema = async (model) => {
  const schema = await getSchema(model)
  const relations = {}
  let foreignKeys = []

  // aggregate the plain String, Int and DateTime fields
  let scalarFields = schema.fields.filter((field) => {
    if (field.relationFromFields) {
      // only build relations for those that are required
      if (field.isRequired && field.relationFromFields.length !== 0) {
        relations[field.name] = {
          foreignKey: field.relationFromFields,
          type: field.type,
        }
      }
      foreignKeys = foreignKeys.concat(field.relationFromFields)
    }

    return (
      field.isRequired &&
      !field.hasDefaultValue && // don't include fields that the database will default
      !field.relationName // this field isn't a relation (ie. comment.post)
    )
  })

  return { scalarFields, relations, foreignKeys }
}

export const scenarioFieldValue = (field) => {
  const randFloat = Math.random() * 10000000
  const randInt = parseInt(Math.random() * 10000000)

  switch (field.type) {
    case 'BigInt':
      return `${BigInt(randInt)}n`
    case 'Boolean':
      return true
    case 'DateTime':
      return new Date()
    case 'Decimal':
    case 'Float':
      return randFloat
    case 'Int':
      return randInt
    case 'Json':
      return { foo: 'bar' }
    case 'String':
      return field.isUnique ? `String${randInt}` : 'String'
    default: {
      if (field.kind === 'enum' && field.enumValues[0]) {
        return field.enumValues[0].dbName || field.enumValues[0].name
      }
    }
  }
}

export const fieldsToScenario = async (
  scalarFields,
  relations,
  foreignKeys
) => {
  const data = {}

  // remove foreign keys from scalars
  scalarFields.forEach((field) => {
    if (!foreignKeys.length || !foreignKeys.includes(field.name)) {
      data[field.name] = scenarioFieldValue(field)
    }
  })

  // add back in related models by name so they can be created with prisma create syntax
  for (const [relationName, relData] of Object.entries(relations)) {
    const relationModelName = relData.type
    const {
      scalarFields: relScalarFields,
      relations: relRelations,
      foreignKeys: relForeignKeys,
    } = await parseSchema(relationModelName)

    data[relationName] = {
      create: await fieldsToScenario(
        relScalarFields,
        relRelations,
        relForeignKeys
      ),
    }
  }

  return data
}

// creates the scenario data based on the data definitions in schema.prisma
export const buildScenario = async (model) => {
  const scenarioModelName = camelcase(model)
  const standardScenario = {
    [scenarioModelName]: {},
  }
  const { scalarFields, relations, foreignKeys } = await parseSchema(model)

  // turn scalar fields into actual scenario data
  for (const name of DEFAULT_SCENARIO_NAMES) {
    standardScenario[scenarioModelName][name] = {}

    const scenarioData = await fieldsToScenario(
      scalarFields,
      relations,
      foreignKeys
    )

    Object.keys(scenarioData).forEach((key) => {
      const value = scenarioData[key]

      if (value && typeof value === 'string' && value.match(/^\d+n$/)) {
        scenarioData[key] = `${value.substr(0, value.length - 1)}n`
      }
    })

    standardScenario[scenarioModelName][name].data = scenarioData
  }

  return standardScenario
}

// creates the scenario data based on the data definitions in schema.prisma
// and transforms data types to strings and other values that are compatible with Prisma
export const buildStringifiedScenario = async (model) => {
  const scenario = await buildScenario(model)

  return JSON.stringify(scenario, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString()
    }

    if (typeof value === 'string' && value.match(/^\d+n$/)) {
      return Number(value.substr(0, value.length - 1))
    }

    return value
  })
}

export const fieldTypes = async (model) => {
  const { scalarFields } = await parseSchema(model)

  // Example value
  // {
  //   name: 'score',
  //   kind: 'scalar',
  //   isList: false,
  //   isRequired: true,
  //   isUnique: false,
  //   isId: false,
  //   isReadOnly: false,
  //   hasDefaultValue: false,
  //   type: 'Int',
  //   isGenerated: false,
  //   isUpdatedAt: false
  // }
  return scalarFields.reduce((acc, value) => {
    acc[value.name] = value.type
    return acc
  }, {})
}

// outputs fields necessary to create an object in the test file
export const fieldsToInput = async (model) => {
  const { scalarFields, foreignKeys } = await parseSchema(model)
  const modelName = camelcase(singularize(model))
  let inputObj = {}

  scalarFields.forEach((field) => {
    if (foreignKeys.includes(field.name)) {
      inputObj[field.name] = `scenario.${modelName}.two.${field.name}`
    } else {
      inputObj[field.name] = scenarioFieldValue(field)
    }
  })

  if (Object.keys(inputObj).length > 0) {
    return inputObj
  } else {
    return false
  }
}

// outputs fields necessary to update an object in the test file
export const fieldsToUpdate = async (model) => {
  const { scalarFields, relations, foreignKeys } = await parseSchema(model)
  const modelName = camelcase(singularize(model))
  let field, newValue, fieldName

  // find an editable scalar field, ideally one that isn't a foreign key
  field = scalarFields.find((scalar) => !foreignKeys.includes(scalar.name))

  // no non-foreign keys, so just take the first one
  if (!field) {
    field = scalarFields[0]
  }

  // if the model has no editable scalar fields, skip update test completely
  if (!field) {
    return false
  }

  if (foreignKeys.includes(field.name)) {
    // no scalar fields, change a relation field instead
    // { post: { foreignKey: [ 'postId' ], type: "Post" }, tag: { foreignKey: [ 'tagId' ], type: "Post" } }
    fieldName = Object.values(relations)[0].foreignKey
    newValue = `scenario.${modelName}.two.${field.name}`
  } else {
    fieldName = field.name

    // change scalar fields
    const value = scenarioFieldValue(field)
    newValue = value

    // depending on the field type, append/update the value to something different
    switch (field.type) {
      case 'BigInt':
        newValue = `${newValue + 1n}`
        break
      case 'Boolean': {
        newValue = !value
        break
      }
      case 'DateTime': {
        let date = new Date()
        date.setDate(date.getDate() + 1)
        newValue = date
        break
      }
      case 'Decimal':
      case 'Float': {
        newValue = newValue + 1.1
        break
      }
      case 'Int': {
        newValue = newValue + 1
        break
      }
      case 'Json': {
        newValue = { foo: 'baz' }
        break
      }
      case 'String': {
        newValue = newValue + '2'
        break
      }
      default: {
        if (
          field.kind === 'enum' &&
          field.enumValues[field.enumValues.length - 1]
        ) {
          const enumVal = field.enumValues[field.enumValues.length - 1]
          newValue = enumVal.dbName || enumVal.name
        }
        break
      }
    }
  }

  return { [fieldName]: newValue }
}

export const files = async ({
  name,
  tests,
  relations,
  typescript,
  ...rest
}) => {
  const componentName = camelcase(pluralize(name))
  const model = name
  const extension = 'ts'
  const serviceFile = templateForComponentFile({
    name,
    componentName: componentName,
    extension: `.${extension}`,
    apiPathSection: 'services',
    generator: 'service',
    templatePath: `service.${extension}.template`,
    templateVars: { relations: relations || [], ...rest },
  })

  const testFile = templateForComponentFile({
    name,
    componentName: componentName,
    extension: `.test.${extension}`,
    apiPathSection: 'services',
    generator: 'service',
    templatePath: `test.${extension}.template`,
    templateVars: {
      relations: relations || [],
      create: await fieldsToInput(model),
      update: await fieldsToUpdate(model),
      types: await fieldTypes(model),
      prismaImport: (await parseSchema(model)).scalarFields.some(
        (field) => field.type === 'Decimal'
      ),
      prismaModel: model,
      ...rest,
    },
  })

  const scenariosFile = templateForComponentFile({
    name,
    componentName: componentName,
    extension: `.scenarios.${extension}`,
    apiPathSection: 'services',
    generator: 'service',
    templatePath: `scenarios.${extension}.template`,
    templateVars: {
      scenario: await buildScenario(model),
      stringifiedScenario: await buildStringifiedScenario(model),
      prismaModel: model,
      ...rest,
    },
  })

  const files = [serviceFile]
  if (tests) {
    files.push(testFile)
    files.push(scenariosFile)
  }

  // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }
  return files.reduce((acc, [outputPath, content]) => {
    if (!typescript) {
      content = transformTSToJS(outputPath, content)
      outputPath = outputPath.replace('.ts', '.js')
    }

    return {
      [outputPath]: content,
      ...acc,
    }
  }, {})
}

export const defaults = {
  ...yargsDefaults,
  tests: {
    description: 'Generate test files',
    type: 'boolean',
  },
  crud: {
    default: true,
    description: 'Create CRUD functions',
    type: 'boolean',
  },
}

export const builder = (yargs) => {
  yargs
    .positional('name', {
      description: 'Name of the service',
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
        'https://redwoodjs.com/docs/cli-commands#generate-service'
      )}`
    )
  Object.entries(defaults).forEach(([option, config]) => {
    yargs.option(option, config)
  })
}

export const { command, description, handler } =
  createYargsForComponentGeneration({
    componentName: 'service',
    preTasksFn: verifyModelName,
    filesFn: files,
  })
