"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.defaults = exports.command = exports.builder = void 0;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

require("core-js/modules/esnext.async-iterator.find.js");

require("core-js/modules/esnext.iterator.find.js");

require("core-js/modules/esnext.async-iterator.reduce.js");

require("core-js/modules/esnext.iterator.reduce.js");

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.for-each.js");

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
  if (Object.entries(types).length) {
    field.type = field.kind === 'object' ? idType(types[field.type]) : field.type;
  }

  const dictionary = {
    Json: 'JSON',
    Decimal: 'Float'
  };
  return `${field.name}: ${field.isList ? '[' : ''}${dictionary[field.type] || field.type}${field.isList ? ']' : ''}${(field.isRequired && required) | field.isList ? '!' : ''}`;
};

const querySDL = model => {
  return model.fields.map(field => modelFieldToSDL(field));
};

const inputSDL = (model, required, types = {}) => {
  return model.fields.filter(field => {
    return IGNORE_FIELDS_FOR_INPUT.indexOf(field.name) === -1 && field.kind !== 'object';
  }).map(field => modelFieldToSDL(field, required, types));
}; // creates the CreateInput type (all fields are required)


const createInputSDL = (model, types = {}) => {
  return inputSDL(model, true, types);
}; // creates the UpdateInput type (not all fields are required)


const updateInputSDL = (model, types = {}) => {
  return inputSDL(model, false, types);
};

const idType = (model, crud) => {
  if (!crud) {
    return undefined;
  }

  const idField = model.fields.find(field => field.isId);

  if (!idField) {
    missingIdConsoleMessage();
    throw new Error('Failed: Could not generate SDL');
  }

  return idField.type;
};

const sdlFromSchemaModel = async (name, crud) => {
  const model = await (0, _schemaHelpers.getSchema)(name); // get models for user-defined types referenced

  const types = (await Promise.all(model.fields.filter(field => field.kind === 'object').map(async field => {
    const model = await (0, _schemaHelpers.getSchema)(field.type);
    return model;
  }))).reduce((acc, cur) => ({ ...acc,
    [cur.name]: cur
  }), {}); // Get enum definition and fields from user-defined types

  const enums = (await Promise.all(model.fields.filter(field => field.kind === 'enum').map(async field => {
    const enumDef = await (0, _schemaHelpers.getEnum)(field.type);
    return enumDef;
  }))).reduce((acc, curr) => acc.concat(curr), []);
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
  yargs.positional('model', {
    description: 'Model to generate the sdl for',
    type: 'string'
  }).option('tests', {
    description: 'Generate test files',
    type: 'boolean'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-sdl')}`); // Merge default options in

  Object.entries(defaults).forEach(([option, config]) => {
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
    const {
      name
    } = await (0, _schemaHelpers.verifyModelName)({
      name: model
    });
    const tasks = new _listr.default([{
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
    }].filter(Boolean), {
      collapse: false,
      exitOnError: true
    });
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;