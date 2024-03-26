"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.defaults = exports.command = exports.builder = void 0;
require("core-js/modules/es.array.push.js");
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));
var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _path = _interopRequireDefault(require("path"));
var _boxen = _interopRequireDefault(require("boxen"));
var _camelcase = _interopRequireDefault(require("camelcase"));
var _chalk = _interopRequireDefault(require("chalk"));
var _listr = require("listr2");
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _generate = require("@redwoodjs/internal/dist/generate/generate");
var _projectConfig = require("@redwoodjs/project-config");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _rollback = require("../../../lib/rollback");
var _rwPluralize = require("../../../lib/rwPluralize");
var _schemaHelpers = require("../../../lib/schemaHelpers");
var _helpers = require("../helpers");
var _service = require("../service/service");
const DEFAULT_IGNORE_FIELDS_FOR_INPUT = ['createdAt', 'updatedAt'];
const missingIdConsoleMessage = () => {
  const line1 = _chalk.default.bold.yellow('WARNING') + ': Cannot generate CRUD SDL without an `@id` database column.';
  const line2 = 'If you are trying to generate for a many-to-many join table ';
  const line3 = "you'll need to update your schema definition to include";
  const line4 = 'an `@id` column. Read more here: ';
  const line5 = _chalk.default.underline.blue('https://redwoodjs.com/docs/schema-relations');
  console.error((0, _boxen.default)(line1 + '\n\n' + line2 + '\n' + line3 + '\n' + line4 + '\n' + line5, {
    padding: 1,
    margin: {
      top: 1,
      bottom: 3,
      right: 1,
      left: 2
    },
    borderStyle: 'single'
  }));
};
const addFieldGraphQLComment = (field, str) => {
  const description = field.documentation || `Description for ${field.name}.`;
  return `
  "${description}"
  ${str}`;
};
const modelFieldToSDL = ({
  field,
  required = true,
  types = {},
  docs = false
}) => {
  if ((0, _entries.default)(types).length) {
    field.type = field.kind === 'object' ? idType(types[field.type]) : field.type;
  }
  const prismaTypeToGraphqlType = {
    Json: 'JSON',
    Decimal: 'Float',
    Bytes: 'Byte'
  };
  const fieldContent = `${field.name}: ${field.isList ? '[' : ''}${prismaTypeToGraphqlType[field.type] || field.type}${field.isList ? ']' : ''}${(field.isRequired && required) | field.isList ? '!' : ''}`;
  if (docs) {
    return addFieldGraphQLComment(field, fieldContent);
  } else {
    return fieldContent;
  }
};
const querySDL = (model, docs = false) => {
  var _context;
  return (0, _map.default)(_context = model.fields).call(_context, field => modelFieldToSDL({
    field,
    docs
  }));
};
const inputSDL = (model, required, types = {}, docs = false) => {
  var _context2, _context3;
  const ignoredFields = DEFAULT_IGNORE_FIELDS_FOR_INPUT;
  return (0, _map.default)(_context2 = (0, _filter.default)(_context3 = model.fields).call(_context3, field => {
    var _context4;
    const idField = (0, _find.default)(_context4 = model.fields).call(_context4, field => field.isId);
    if (idField) {
      ignoredFields.push(idField.name);
    }
    return (0, _indexOf.default)(ignoredFields).call(ignoredFields, field.name) === -1 && field.kind !== 'object';
  })).call(_context2, field => modelFieldToSDL({
    field,
    required,
    types,
    docs
  }));
};

// creates the CreateInput type (all fields are required)
const createInputSDL = (model, types = {}, docs = false) => {
  return inputSDL(model, true, types, docs);
};

// creates the UpdateInput type (not all fields are required)
const updateInputSDL = (model, types = {}, docs = false) => {
  return inputSDL(model, false, types, docs);
};
const idType = (model, crud) => {
  var _context5;
  if (!crud) {
    return undefined;
  }
  const idField = (0, _find.default)(_context5 = model.fields).call(_context5, field => field.isId);
  if (!idField) {
    missingIdConsoleMessage();
    throw new Error('Failed: Could not generate SDL');
  }
  return idField.type;
};
const idName = (model, crud) => {
  var _context6;
  if (!crud) {
    return undefined;
  }
  const idField = (0, _find.default)(_context6 = model.fields).call(_context6, field => field.isId);
  if (!idField) {
    missingIdConsoleMessage();
    throw new Error('Failed: Could not generate SDL');
  }
  return idField.name;
};
const sdlFromSchemaModel = async (name, crud, docs = false) => {
  var _context7, _context8, _context9, _context10, _context11, _context12;
  const model = await (0, _schemaHelpers.getSchema)(name);

  // get models for user-defined types referenced
  const types = (0, _reduce.default)(_context7 = await _promise.default.all((0, _map.default)(_context8 = (0, _filter.default)(_context9 = model.fields).call(_context9, field => field.kind === 'object')).call(_context8, async field => {
    const model = await (0, _schemaHelpers.getSchema)(field.type);
    return model;
  }))).call(_context7, (acc, cur) => ({
    ...acc,
    [cur.name]: cur
  }), {});

  // Get enum definition and fields from user-defined types
  const enums = (0, _reduce.default)(_context10 = await _promise.default.all((0, _map.default)(_context11 = (0, _filter.default)(_context12 = model.fields).call(_context12, field => field.kind === 'enum')).call(_context11, async field => {
    const enumDef = await (0, _schemaHelpers.getEnum)(field.type);
    return enumDef;
  }))).call(_context10, (acc, curr) => (0, _concat.default)(acc).call(acc, curr), []);
  const modelName = model.name;
  const modelDescription = model.documentation || `Representation of ${modelName}.`;
  return {
    modelName,
    modelDescription,
    query: querySDL(model, docs).join('\n    '),
    createInput: createInputSDL(model, types, docs).join('\n    '),
    updateInput: updateInputSDL(model, types, docs).join('\n    '),
    idType: idType(model, crud),
    idName: idName(model, crud),
    relations: (0, _helpers.relationsForModel)(model),
    enums
  };
};
const files = async ({
  name,
  crud = true,
  docs = false,
  tests,
  typescript
}) => {
  const {
    modelName,
    modelDescription,
    query,
    createInput,
    updateInput,
    idType,
    idName,
    relations,
    enums
  } = await sdlFromSchemaModel(name, crud, docs);
  const templatePath = (0, _helpers.customOrDefaultTemplatePath)({
    side: 'api',
    generator: 'sdl',
    templatePath: 'sdl.ts.template'
  });
  let template = await (0, _lib.generateTemplate)(templatePath, {
    docs,
    modelName,
    modelDescription,
    name,
    crud,
    query,
    createInput,
    updateInput,
    idType,
    idName,
    enums
  });
  const extension = typescript ? 'ts' : 'js';
  let outputPath = _path.default.join((0, _lib.getPaths)().api.graphql, `${(0, _camelcase.default)((0, _rwPluralize.pluralize)(name))}.sdl.${extension}`);
  if (typescript) {
    template = await (0, _lib.transformTSToJS)(outputPath, template);
  }
  return {
    [outputPath]: template,
    ...(await (0, _service.files)({
      name,
      crud,
      tests,
      relations,
      typescript
    }))
  };
};
exports.files = files;
const defaults = exports.defaults = {
  ..._helpers.yargsDefaults,
  crud: {
    default: true,
    description: 'Also generate mutations',
    type: 'boolean'
  }
};
const command = exports.command = 'sdl <model>';
const description = exports.description = 'Generate a GraphQL schema and service component based on a given DB schema Model';
const builder = yargs => {
  var _context13;
  yargs.positional('model', {
    description: 'Model to generate the sdl for',
    type: 'string'
  }).option('tests', {
    description: 'Generate test files',
    type: 'boolean'
    // don't give it a default value, it gets overwritten in first few lines
    // of the handler
  }).option('docs', {
    description: 'Generate SDL and GraphQL comments to use in documentation',
    type: 'boolean'
  }).option('rollback', {
    description: 'Revert all generator actions if an error occurs',
    type: 'boolean',
    default: true
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-sdl')}`);

  // Merge default options in
  (0, _forEach.default)(_context13 = (0, _entries.default)(defaults)).call(_context13, ([option, config]) => {
    yargs.option(option, config);
  });
};
// TODO: Add --dry-run command
exports.builder = builder;
const handler = async ({
  model,
  crud,
  force,
  tests,
  typescript,
  docs,
  rollback
}) => {
  if (tests === undefined) {
    tests = (0, _projectConfig.getConfig)().generate.tests;
  }
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'generate sdl',
    crud,
    force,
    tests,
    typescript,
    docs,
    rollback
  });
  try {
    var _context14;
    const {
      name
    } = await (0, _schemaHelpers.verifyModelName)({
      name: model
    });
    const tasks = new _listr.Listr((0, _filter.default)(_context14 = [{
      title: 'Generating SDL files...',
      task: async () => {
        const f = await files({
          name,
          tests,
          crud,
          typescript,
          docs
        });
        return (0, _lib.writeFilesTask)(f, {
          overwriteExisting: force
        });
      }
    }, {
      title: `Generating types ...`,
      task: async () => {
        const {
          errors
        } = await (0, _generate.generate)();
        for (const {
          message,
          error
        } of errors) {
          console.error(message);
          console.log();
          console.error(error);
          console.log();
        }
        (0, _rollback.addFunctionToRollback)(_generate.generate, true);
      }
    }]).call(_context14, Boolean), {
      rendererOptions: {
        collapseSubtasks: false
      },
      exitOnError: true,
      silentRendererCondition: process.env.NODE_ENV === 'test'
    });
    if (rollback && !force) {
      (0, _rollback.prepareForRollback)(tasks);
    }
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
};
exports.handler = handler;