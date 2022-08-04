"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scenarioFieldValue = exports.parseSchema = exports.handler = exports.files = exports.fieldsToUpdate = exports.fieldsToScenario = exports.fieldsToInput = exports.description = exports.defaults = exports.command = exports.builder = exports.buildStringifiedScenario = exports.buildScenario = void 0;

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.for-each.js");

require("core-js/modules/esnext.async-iterator.find.js");

require("core-js/modules/esnext.iterator.find.js");

require("core-js/modules/esnext.async-iterator.reduce.js");

require("core-js/modules/esnext.iterator.reduce.js");

var _camelcase = _interopRequireDefault(require("camelcase"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _lib = require("../../../lib");

var _rwPluralize = require("../../../lib/rwPluralize");

var _schemaHelpers = require("../../../lib/schemaHelpers");

var _generate = require("../../generate");

var _helpers = require("../helpers");

const DEFAULT_SCENARIO_NAMES = ['one', 'two']; // parses the schema into scalar fields, relations and an array of foreign keys

const parseSchema = async model => {
  const schema = await (0, _schemaHelpers.getSchema)(model);
  const relations = {};
  let foreignKeys = []; // aggregate the plain String, Int and DateTime fields

  let scalarFields = schema.fields.filter(field => {
    if (field.relationFromFields) {
      // only build relations for those that are required
      if (field.isRequired && field.relationFromFields.length !== 0) {
        relations[field.name] = {
          foreignKey: field.relationFromFields,
          type: field.type
        };
      }

      foreignKeys = foreignKeys.concat(field.relationFromFields);
    }

    return field.isRequired && !field.hasDefaultValue && // don't include fields that the database will default
    !field.relationName // this field isn't a relation (ie. comment.post)
    ;
  });
  return {
    scalarFields,
    relations,
    foreignKeys
  };
};

exports.parseSchema = parseSchema;

const scenarioFieldValue = field => {
  const randFloat = Math.random() * 10000000;
  const randInt = parseInt(Math.random() * 10000000);

  switch (field.type) {
    case 'BigInt':
      // eslint-disable-next-line no-undef
      return `${BigInt(randInt)}n`;

    case 'Boolean':
      return true;

    case 'DateTime':
      return new Date().toISOString().replace(/\.\d{3}/, '');

    case 'Decimal':
    case 'Float':
      return randFloat;

    case 'Int':
      return randInt;

    case 'Json':
      return {
        foo: 'bar'
      };

    case 'String':
      return field.isUnique ? `String${randInt}` : 'String';

    default:
      {
        if (field.kind === 'enum' && field.enumValues[0]) {
          return field.enumValues[0].dbName || field.enumValues[0].name;
        }
      }
  }
};

exports.scenarioFieldValue = scenarioFieldValue;

const fieldsToScenario = async (scalarFields, relations, foreignKeys) => {
  const data = {}; // remove foreign keys from scalars

  scalarFields.forEach(field => {
    if (!foreignKeys.length || !foreignKeys.includes(field.name)) {
      data[field.name] = scenarioFieldValue(field);
    }
  }); // add back in related models by name so they can be created with prisma create syntax

  for (const [relationName, relData] of Object.entries(relations)) {
    const relationModelName = relData.type;
    const {
      scalarFields: relScalarFields,
      relations: relRelations,
      foreignKeys: relForeignKeys
    } = await parseSchema(relationModelName);
    data[relationName] = {
      create: await fieldsToScenario(relScalarFields, relRelations, relForeignKeys)
    };
  }

  return data;
}; // creates the scenario data based on the data definitions in schema.prisma


exports.fieldsToScenario = fieldsToScenario;

const buildScenario = async model => {
  const scenarioModelName = (0, _camelcase.default)(model);
  const standardScenario = {
    [scenarioModelName]: {}
  };
  const {
    scalarFields,
    relations,
    foreignKeys
  } = await parseSchema(model); // turn scalar fields into actual scenario data

  for (const name of DEFAULT_SCENARIO_NAMES) {
    standardScenario[scenarioModelName][name] = {};
    const scenarioData = await fieldsToScenario(scalarFields, relations, foreignKeys);
    Object.keys(scenarioData).forEach(key => {
      const value = scenarioData[key];

      if (value && typeof value === 'string' && value.match(/^\d+n$/)) {
        scenarioData[key] = `${value.substr(0, value.length - 1)}n`;
      }
    });
    standardScenario[scenarioModelName][name].data = scenarioData;
  }

  return standardScenario;
}; // creates the scenario data based on the data definitions in schema.prisma
// and transforms data types to strings and other values that are compatible with Prisma


exports.buildScenario = buildScenario;

const buildStringifiedScenario = async model => {
  const scenario = await buildScenario(model);
  return JSON.stringify(scenario, (key, value) => typeof value === 'bigint' ? value.toString() : typeof value === 'string' && value.match(/^\d+n$/) ? Number(value.substr(0, value.length - 1)) : value);
}; // outputs fields necessary to create an object in the test file


exports.buildStringifiedScenario = buildStringifiedScenario;

const fieldsToInput = async model => {
  const {
    scalarFields,
    foreignKeys
  } = await parseSchema(model);
  const modelName = (0, _camelcase.default)((0, _rwPluralize.singularize)(model));
  let inputObj = {};
  scalarFields.forEach(field => {
    if (foreignKeys.includes(field.name)) {
      inputObj[field.name] = `scenario.${modelName}.two.${field.name}`;
    } else {
      inputObj[field.name] = scenarioFieldValue(field);
    }
  });

  if (Object.keys(inputObj).length > 0) {
    return inputObj;
  } else {
    return false;
  }
}; // outputs fields necessary to update an object in the test file


exports.fieldsToInput = fieldsToInput;

const fieldsToUpdate = async model => {
  const {
    scalarFields,
    relations,
    foreignKeys
  } = await parseSchema(model);
  const modelName = (0, _camelcase.default)((0, _rwPluralize.singularize)(model));
  let field, newValue, fieldName; // find an editable scalar field, ideally one that isn't a foreign key

  field = scalarFields.find(scalar => !foreignKeys.includes(scalar.name)); // no non-foreign keys, so just take the first one

  if (!field) {
    field = scalarFields[0];
  } // if the model has no editable scalar fields, skip update test completely


  if (!field) {
    return false;
  }

  if (foreignKeys.includes(field.name)) {
    // no scalar fields, change a relation field instead
    // { post: { foreignKey: [ 'postId' ], type: "Post" }, tag: { foreignKey: [ 'tagId' ], type: "Post" } }
    fieldName = Object.values(relations)[0].foreignKey;
    newValue = `scenario.${modelName}.two.${field.name}`;
  } else {
    fieldName = field.name; // change scalar fields

    const value = scenarioFieldValue(field);
    newValue = value; // depending on the field type, append/update the value to something different

    switch (field.type) {
      case 'BigInt':
        // eslint-disable-next-line no-undef
        newValue = `${newValue + 1n}`;
        break;

      case 'Boolean':
        {
          newValue = !value;
          break;
        }

      case 'DateTime':
        {
          let date = new Date();
          date.setDate(date.getDate() + 1);
          newValue = date.toISOString().replace(/\.\d{3}/, '');
          break;
        }

      case 'Decimal':
      case 'Float':
        {
          newValue = newValue + 1.1;
          break;
        }

      case 'Int':
        {
          newValue = newValue + 1;
          break;
        }

      case 'Json':
        {
          newValue = {
            foo: 'baz'
          };
          break;
        }

      case 'String':
        {
          newValue = newValue + '2';
          break;
        }

      default:
        {
          if (field.kind === 'enum' && field.enumValues[field.enumValues.length - 1]) {
            const enumVal = field.enumValues[field.enumValues.length - 1];
            newValue = enumVal.dbName || enumVal.name;
          }

          break;
        }
    }
  }

  return {
    [fieldName]: newValue
  };
};

exports.fieldsToUpdate = fieldsToUpdate;

const files = async ({
  name,
  tests,
  relations,
  typescript,
  ...rest
}) => {
  const componentName = (0, _camelcase.default)((0, _rwPluralize.pluralize)(name));
  const model = name;
  const extension = 'ts';
  const serviceFile = (0, _helpers.templateForComponentFile)({
    name,
    componentName: componentName,
    extension: `.${extension}`,
    apiPathSection: 'services',
    generator: 'service',
    templatePath: `service.${extension}.template`,
    templateVars: {
      relations: relations || [],
      ...rest
    }
  });
  const testFile = (0, _helpers.templateForComponentFile)({
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
      prismaModel: model,
      ...rest
    }
  });
  const scenariosFile = (0, _helpers.templateForComponentFile)({
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
      ...rest
    }
  });
  const files = [serviceFile];

  if (tests) {
    files.push(testFile);
    files.push(scenariosFile);
  } // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }


  return files.reduce((acc, [outputPath, content]) => {
    if (!typescript) {
      content = (0, _lib.transformTSToJS)(outputPath, content);
      outputPath = outputPath.replace('.ts', '.js');
    }

    return {
      [outputPath]: content,
      ...acc
    };
  }, {});
};

exports.files = files;
const defaults = { ..._generate.yargsDefaults,
  tests: {
    description: 'Generate test files',
    type: 'boolean'
  },
  crud: {
    default: true,
    description: 'Create CRUD functions',
    type: 'boolean'
  }
};
exports.defaults = defaults;

const builder = yargs => {
  yargs.positional('name', {
    description: 'Name of the service',
    type: 'string'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-service')}`);
  Object.entries(defaults).forEach(([option, config]) => {
    yargs.option(option, config);
  });
};

exports.builder = builder;
const {
  command,
  description,
  handler
} = (0, _helpers.createYargsForComponentGeneration)({
  componentName: 'service',
  preTasksFn: _schemaHelpers.verifyModelName,
  filesFn: files
});
exports.handler = handler;
exports.description = description;
exports.command = command;