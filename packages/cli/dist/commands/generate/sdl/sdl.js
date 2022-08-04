"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.files = exports.description = exports.defaults = exports.command = exports.builder = void 0;

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _path = _interopRequireDefault(require("path"));

var _boxen = _interopRequireDefault(require("boxen"));

var _camelcase = _interopRequireDefault(require("camelcase"));

var _chalk = _interopRequireDefault(require("chalk"));

var _listr = _interopRequireDefault(require("listr"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _config = require("@redwoodjs/internal/dist/config");

var _generate = require("@redwoodjs/internal/dist/generate/generate");

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _rwPluralize = require("../../../lib/rwPluralize");

var _schemaHelpers = require("../../../lib/schemaHelpers");

var _generate2 = require("../../generate");

var _helpers = require("../helpers");

var _service = require("../service/service");

const IGNORE_FIELDS_FOR_INPUT = ['id', 'createdAt', 'updatedAt'];

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

const modelFieldToSDL = (field, required = true, types = {}) => {
  if ((0, _entries.default)(types).length) {
    field.type = field.kind === 'object' ? idType(types[field.type]) : field.type;
  }

  const dictionary = {
    Json: 'JSON',
    Decimal: 'Float'
  };
  return `${field.name}: ${field.isList ? '[' : ''}${dictionary[field.type] || field.type}${field.isList ? ']' : ''}${(field.isRequired && required) | field.isList ? '!' : ''}`;
};

const querySDL = model => {
  var _context;

  return (0, _map.default)(_context = model.fields).call(_context, field => modelFieldToSDL(field));
};

const inputSDL = (model, required, types = {}) => {
  var _context2, _context3;

  return (0, _map.default)(_context2 = (0, _filter.default)(_context3 = model.fields).call(_context3, field => {
    return (0, _indexOf.default)(IGNORE_FIELDS_FOR_INPUT).call(IGNORE_FIELDS_FOR_INPUT, field.name) === -1 && field.kind !== 'object';
  })).call(_context2, field => modelFieldToSDL(field, required, types));
}; // creates the CreateInput type (all fields are required)


const createInputSDL = (model, types = {}) => {
  return inputSDL(model, true, types);
}; // creates the UpdateInput type (not all fields are required)


const updateInputSDL = (model, types = {}) => {
  return inputSDL(model, false, types);
};

const idType = (model, crud) => {
  var _context4;

  if (!crud) {
    return undefined;
  }

  const idField = (0, _find.default)(_context4 = model.fields).call(_context4, field => field.isId);

  if (!idField) {
    missingIdConsoleMessage();
    throw new Error('Failed: Could not generate SDL');
  }

  return idField.type;
};

const sdlFromSchemaModel = async (name, crud) => {
  var _context5, _context6, _context7, _context8, _context9, _context10;

  const model = await (0, _schemaHelpers.getSchema)(name); // get models for user-defined types referenced

  const types = (0, _reduce.default)(_context5 = await _promise.default.all((0, _map.default)(_context6 = (0, _filter.default)(_context7 = model.fields).call(_context7, field => field.kind === 'object')).call(_context6, async field => {
    const model = await (0, _schemaHelpers.getSchema)(field.type);
    return model;
  }))).call(_context5, (acc, cur) => ({ ...acc,
    [cur.name]: cur
  }), {}); // Get enum definition and fields from user-defined types

  const enums = (0, _reduce.default)(_context8 = await _promise.default.all((0, _map.default)(_context9 = (0, _filter.default)(_context10 = model.fields).call(_context10, field => field.kind === 'enum')).call(_context9, async field => {
    const enumDef = await (0, _schemaHelpers.getEnum)(field.type);
    return enumDef;
  }))).call(_context8, (acc, curr) => (0, _concat.default)(acc).call(acc, curr), []);
  return {
    query: querySDL(model).join('\n    '),
    createInput: createInputSDL(model, types).join('\n    '),
    updateInput: updateInputSDL(model, types).join('\n    '),
    idType: idType(model, crud),
    relations: (0, _helpers.relationsForModel)(model),
    enums
  };
};

const files = async ({
  name,
  crud = true,
  tests,
  typescript
}) => {
  const {
    query,
    createInput,
    updateInput,
    idType,
    relations,
    enums
  } = await sdlFromSchemaModel(name, crud);
  const templatePath = (0, _helpers.customOrDefaultTemplatePath)({
    side: 'api',
    generator: 'sdl',
    templatePath: 'sdl.ts.template'
  });
  let template = (0, _lib.generateTemplate)(templatePath, {
    name,
    crud,
    query,
    createInput,
    updateInput,
    idType,
    enums
  });
  const extension = typescript ? 'ts' : 'js';

  let outputPath = _path.default.join((0, _lib.getPaths)().api.graphql, `${(0, _camelcase.default)((0, _rwPluralize.pluralize)(name))}.sdl.${extension}`);

  if (typescript) {
    template = (0, _lib.transformTSToJS)(outputPath, template);
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
const defaults = { ..._generate2.yargsDefaults,
  crud: {
    default: true,
    description: 'Also generate mutations',
    type: 'boolean'
  }
};
exports.defaults = defaults;
const command = 'sdl <model>';
exports.command = command;
const description = 'Generate a GraphQL schema and service component based on a given DB schema Model';
exports.description = description;

const builder = yargs => {
  var _context11;

  yargs.positional('model', {
    description: 'Model to generate the sdl for',
    type: 'string'
  }).option('tests', {
    description: 'Generate test files',
    type: 'boolean'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-sdl')}`); // Merge default options in

  (0, _forEach.default)(_context11 = (0, _entries.default)(defaults)).call(_context11, ([option, config]) => {
    yargs.option(option, config);
  });
}; // TODO: Add --dry-run command


exports.builder = builder;

const handler = async ({
  model,
  crud,
  force,
  tests,
  typescript
}) => {
  if (tests === undefined) {
    tests = (0, _config.getConfig)().generate.tests;
  }

  try {
    var _context12;

    const {
      name
    } = await (0, _schemaHelpers.verifyModelName)({
      name: model
    });
    const tasks = new _listr.default((0, _filter.default)(_context12 = [{
      title: 'Generating SDL files...',
      task: async () => {
        const f = await files({
          name,
          tests,
          crud,
          typescript
        });
        return (0, _lib.writeFilesTask)(f, {
          overwriteExisting: force
        });
      }
    }, {
      title: `Generating types ...`,
      task: _generate.generate
    }]).call(_context12, Boolean), {
      collapse: false,
      exitOnError: true
    });
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
};

exports.handler = handler;