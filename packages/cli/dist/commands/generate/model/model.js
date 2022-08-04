"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

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
  var _context;

  yargs.positional('name', {
    description: 'Name of the model to create',
    type: 'string'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('RedwoodRecord Reference', 'https://redwoodjs.com/docs/redwoodrecord')}`);
  (0, _forEach.default)(_context = (0, _entries.default)(_generate.yargsDefaults)).call(_context, ([option, config]) => {
    yargs.option(option, config);
  });
};

exports.builder = builder;

const handler = async ({
  force,
  ...args
}) => {
  var _context2;

  const tasks = new _listr.default((0, _filter.default)(_context2 = [{
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
      } = await _promise.default.resolve().then(() => (0, _interopRequireWildcard2.default)(require('@redwoodjs/record')));
      await parseDatamodel();
    }
  }]).call(_context2, Boolean), {
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