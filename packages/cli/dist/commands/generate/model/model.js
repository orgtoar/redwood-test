"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.filter.js");

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _schemaHelpers = require("../../../lib/schemaHelpers");

var _generate = require("../../generate");

const TEMPLATE_PATH = _path.default.resolve(__dirname, 'templates', 'model.js.template');

const files = ({
  name,
  typescript = false
}) => {
  const outputFilename = `${name}.${typescript ? 'ts' : 'js'}`;

  const outputPath = _path.default.join((0, _lib.getPaths)().api.models, outputFilename);

  return {
    [outputPath]: (0, _lib.generateTemplate)(TEMPLATE_PATH, {
      name
    })
  };
};

exports.files = files;
const command = 'model <name>';
exports.command = command;
const description = 'Generate a RedwoodRecord model';
exports.description = description;

const builder = yargs => {
  yargs.positional('name', {
    description: 'Name of the model to create',
    type: 'string'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('RedwoodRecord Reference', 'https://redwoodjs.com/docs/redwoodrecord')}`);
  Object.entries(_generate.yargsDefaults).forEach(([option, config]) => {
    yargs.option(option, config);
  });
};

exports.builder = builder;

const handler = async ({
  force,
  ...args
}) => {
  const tasks = new _listr.default([{
    title: 'Generating model file...',
    task: () => {
      return (0, _lib.writeFilesTask)(files(args), {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Parsing datamodel, generating api/src/models/index.js...',
    task: async () => {
      const {
        parseDatamodel
      } = await Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('@redwoodjs/record')));
      await parseDatamodel();
    }
  }].filter(Boolean), {
    collapse: false
  });

  try {
    await (0, _schemaHelpers.verifyModelName)({
      name: args.name
    });
    await tasks.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
    process.exit(1);
  }
};

exports.handler = handler;