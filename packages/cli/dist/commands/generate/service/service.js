"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.scenarioFieldValue = exports.parseSchema = exports.handler = exports.files = exports.fieldsToUpdate = exports.fieldsToScenario = exports.fieldsToInput = exports.fieldTypes = exports.description = exports.defaults = exports.command = exports.builder = exports.buildStringifiedScenario = exports.buildScenario = void 0;
require("core-js/modules/es.array.push.js");
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));
var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));
var _values = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/values"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));
var _camelcase = _interopRequireDefault(require("camelcase"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _lib = require("../../../lib");
var _rwPluralize = require("../../../lib/rwPluralize");
var _schemaHelpers = require("../../../lib/schemaHelpers");
var _helpers = require("../helpers");
const DEFAULT_SCENARIO_NAMES = ['one', 'two'];

// parses the schema into scalar fields, relations and an array of foreign keys
const parseSchema = async model => {
  var _context;
  const schema = await (0, _schemaHelpers.getSchema)(model);
  const relations = {};
  let foreignKeys = [];

  // aggregate the plain String, Int and DateTime fields
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
    return field.isRequired && !field.hasDefaultValue &&
    // don't include fields that the database will default
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
  const randIntArray = [(0, _parseInt2.default)(Math.random() * 300), (0, _parseInt2.default)(Math.random() * 300), (0, _parseInt2.default)(Math.random() * 300)];
  switch (field.type) {
    case 'BigInt':
      return `${BigInt(randInt)}n`;
    case 'Boolean':
      return true;
    case 'DateTime':
      return new Date();
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
    case 'Bytes':
      return `Buffer.from([${randIntArray}])`;
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
  const data = {};

  // remove foreign keys from scalars
  (0, _forEach.default)(scalarFields).call(scalarFields, field => {
    if (!foreignKeys.length || !(0, _includes.default)(foreignKeys).call(foreignKeys, field.name)) {
      data[field.name] = scenarioFieldValue(field);
    }
  });

  // add back in related models by name so they can be created with prisma create syntax
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
};

// creates the scenario data based on the data definitions in schema.prisma
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
  } = await parseSchema(model);

  // turn scalar fields into actual scenario data
  for (const name of DEFAULT_SCENARIO_NAMES) {
    var _context2;
    standardScenario[scenarioModelName][name] = {};
    const scenarioData = await fieldsToScenario(scalarFields, relations, foreignKeys);
    (0, _forEach.default)(_context2 = (0, _keys.default)(scenarioData)).call(_context2, key => {
      const value = scenarioData[key];

      // Support BigInt
      if (value && typeof value === 'string' && value.match(/^\d+n$/)) {
        scenarioData[key] = `${(0, _slice.default)(value).call(value, 0, value.length - 1)}n`;
      }
    });
    standardScenario[scenarioModelName][name].data = scenarioData;
  }
  return standardScenario;
};

// creates the scenario data based on the data definitions in schema.prisma
// and transforms data types to strings and other values that are compatible with Prisma
exports.buildScenario = buildScenario;
const buildStringifiedScenario = async model => {
  const scenario = await buildScenario(model);
  const jsonString = (0, _stringify.default)(scenario, (_key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (typeof value === 'string' && value.match(/^\d+n$/)) {
      return Number((0, _slice.default)(value).call(value, 0, value.length - 1));
    }
    return value;
  });

  // Not all values can be represented as JSON, like function invocations
  return jsonString.replace(/"Buffer\.from\(([^)]+)\)"/g, 'Buffer.from($1)');
};
exports.buildStringifiedScenario = buildStringifiedScenario;
const fieldTypes = async model => {
  const {
    scalarFields
  } = await parseSchema(model);

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
  return (0, _reduce.default)(scalarFields).call(scalarFields, (acc, value) => {
    acc[value.name] = value.type;
    return acc;
  }, {});
};

// outputs fields necessary to create an object in the test file
exports.fieldTypes = fieldTypes;
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
};

// outputs fields necessary to update an object in the test file
exports.fieldsToInput = fieldsToInput;
const fieldsToUpdate = async model => {
  const {
    scalarFields,
    relations,
    foreignKeys
  } = await parseSchema(model);
  const modelName = (0, _camelcase.default)((0, _rwPluralize.singularize)(model));
  let field, newValue, fieldName;

  // find an editable scalar field, ideally one that isn't a foreign key
  field = (0, _find.default)(scalarFields).call(scalarFields, scalar => !(0, _includes.default)(foreignKeys).call(foreignKeys, scalar.name));

  // no non-foreign keys, so just take the first one
  if (!field) {
    field = scalarFields[0];
  }

  // if the model has no editable scalar fields, skip update test completely
  if (!field) {
    return false;
  }
  if ((0, _includes.default)(foreignKeys).call(foreignKeys, field.name)) {
    // no scalar fields, change a relation field instead
    // { post: { foreignKey: [ 'postId' ], type: "Post" }, tag: { foreignKey: [ 'tagId' ], type: "Post" } }
    fieldName = (0, _values.default)(relations)[0].foreignKey;
    newValue = `scenario.${modelName}.two.${field.name}`;
  } else {
    fieldName = field.name;

    // change scalar fields
    const value = scenarioFieldValue(field);
    newValue = value;

    // depending on the field type, append/update the value to something different
    switch (field.type) {
      case 'BigInt':
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
          newValue = date;
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
const getIdName = async model => {
  var _context3;
  const schema = await (0, _schemaHelpers.getSchema)(model);
  return (0, _find.default)(_context3 = schema.fields).call(_context3, field => field.isId)?.name;
};
const files = async ({
  name,
  tests,
  relations,
  typescript,
  ...rest
}) => {
  var _context4;
  const componentName = (0, _camelcase.default)((0, _rwPluralize.pluralize)(name));
  const model = name;
  const idName = await getIdName(model);
  const extension = 'ts';
  const serviceFile = await (0, _helpers.templateForComponentFile)({
    name,
    componentName: componentName,
    extension: `.${extension}`,
    apiPathSection: 'services',
    generator: 'service',
    templatePath: `service.${extension}.template`,
    templateVars: {
      relations: relations || [],
      idName,
      ...rest
    }
  });
  const testFile = await (0, _helpers.templateForComponentFile)({
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
      prismaImport: (0, _some.default)(_context4 = (await parseSchema(model)).scalarFields).call(_context4, field => field.type === 'Decimal'),
      prismaModel: model,
      idName,
      ...rest
    }
  });
  const scenariosFile = await (0, _helpers.templateForComponentFile)({
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
      idName,
      ...rest
    }
  });
  const files = [serviceFile];
  if (tests) {
    files.push(testFile);
    files.push(scenariosFile);
  }

  // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }
  return (0, _reduce.default)(files).call(files, async (accP, [outputPath, content]) => {
    const acc = await accP;
    if (!typescript) {
      content = await (0, _lib.transformTSToJS)(outputPath, content);
      outputPath = outputPath.replace('.ts', '.js');
    }
    return {
      [outputPath]: content,
      ...acc
    };
  }, _promise.default.resolve({}));
};
exports.files = files;
const defaults = exports.defaults = {
  ..._helpers.yargsDefaults,
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
const builder = yargs => {
  var _context5;
  yargs.positional('name', {
    description: 'Name of the service',
    type: 'string'
  }).option('rollback', {
    description: 'Revert all generator actions if an error occurs',
    type: 'boolean',
    default: true
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-service')}`);
  (0, _forEach.default)(_context5 = (0, _entries.default)(defaults)).call(_context5, ([option, config]) => {
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