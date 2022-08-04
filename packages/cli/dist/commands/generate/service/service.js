"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.scenarioFieldValue = exports.parseSchema = exports.handler = exports.files = exports.fieldsToUpdate = exports.fieldsToScenario = exports.fieldsToInput = exports.description = exports.defaults = exports.command = exports.builder = exports.buildStringifiedScenario = exports.buildScenario = void 0;

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _values = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/values"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _camelcase = _interopRequireDefault(require("camelcase"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _lib = require("../../../lib");

var _rwPluralize = require("../../../lib/rwPluralize");

var _schemaHelpers = require("../../../lib/schemaHelpers");

var _generate = require("../../generate");

var _helpers = require("../helpers");

const DEFAULT_SCENARIO_NAMES = ['one', 'two']; // parses the schema into scalar fields, relations and an array of foreign keys

const parseSchema = async model => {
  var _context;

  const schema = await (0, _schemaHelpers.getSchema)(model);
  const relations = {};
  let foreignKeys = []; // aggregate the plain String, Int and DateTime fields

  let scalarFields = (0, _filter.default)(_context = schema.fields).call(_context, field => {
    if (field.relationFromFields) {
      // only build relations for those that are required
      if (field.isRequired && field.relationFromFields.length !== 0) {
        relations[field.name] = {
          foreignKey: field.relationFromFields,
          type: field.type
        };
      }

      foreignKeys = (0, _concat.default)(foreignKeys).call(foreignKeys, field.relationFromFields);
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
  const randInt = (0, _parseInt2.default)(Math.random() * 10000000);

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

  (0, _forEach.default)(scalarFields).call(scalarFields, field => {
    if (!foreignKeys.length || !(0, _includes.default)(foreignKeys).call(foreignKeys, field.name)) {
      data[field.name] = scenarioFieldValue(field);
    }
  }); // add back in related models by name so they can be created with prisma create syntax

  for (const [relationName, relData] of (0, _entries.default)(relations)) {
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
    var _context2;

    standardScenario[scenarioModelName][name] = {};
    const scenarioData = await fieldsToScenario(scalarFields, relations, foreignKeys);
    (0, _forEach.default)(_context2 = (0, _keys.default)(scenarioData)).call(_context2, key => {
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
  return (0, _stringify.default)(scenario, (key, value) => typeof value === 'bigint' ? value.toString() : typeof value === 'string' && value.match(/^\d+n$/) ? Number(value.substr(0, value.length - 1)) : value);
}; // outputs fields necessary to create an object in the test file


exports.buildStringifiedScenario = buildStringifiedScenario;

const fieldsToInput = async model => {
  const {
    scalarFields,
    foreignKeys
  } = await parseSchema(model);
  const modelName = (0, _camelcase.default)((0, _rwPluralize.singularize)(model));
  let inputObj = {};
  (0, _forEach.default)(scalarFields).call(scalarFields, field => {
    if ((0, _includes.default)(foreignKeys).call(foreignKeys, field.name)) {
      inputObj[field.name] = `scenario.${modelName}.two.${field.name}`;
    } else {
      inputObj[field.name] = scenarioFieldValue(field);
    }
  });

  if ((0, _keys.default)(inputObj).length > 0) {
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

  field = (0, _find.default)(scalarFields).call(scalarFields, scalar => !(0, _includes.default)(foreignKeys).call(foreignKeys, scalar.name)); // no non-foreign keys, so just take the first one

  if (!field) {
    field = scalarFields[0];
  } // if the model has no editable scalar fields, skip update test completely


  if (!field) {
    return false;
  }

  if ((0, _includes.default)(foreignKeys).call(foreignKeys, field.name)) {
    // no scalar fields, change a relation field instead
    // { post: { foreignKey: [ 'postId' ], type: "Post" }, tag: { foreignKey: [ 'tagId' ], type: "Post" } }
    fieldName = (0, _values.default)(relations)[0].foreignKey;
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


  return (0, _reduce.default)(files).call(files, (acc, [outputPath, content]) => {
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
  var _context3;

  yargs.positional('name', {
    description: 'Name of the service',
    type: 'string'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-service')}`);
  (0, _forEach.default)(_context3 = (0, _entries.default)(defaults)).call(_context3, ([option, config]) => {
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