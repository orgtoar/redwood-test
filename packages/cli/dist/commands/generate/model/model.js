"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _path = _interopRequireDefault(require("path"));
var _listr = require("listr2");
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _rollback = require("../../../lib/rollback");
var _schemaHelpers = require("../../../lib/schemaHelpers");
var _helpers = require("../helpers");
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
const command = exports.command = 'model <name>';
const description = exports.description = 'Generate a RedwoodRecord model';
const builder = yargs => {
  var _context;
  yargs.positional('name', {
    description: 'Name of the model to create',
    type: 'string'
  }).option('rollback', {
    description: 'Revert all generator actions if an error occurs',
    type: 'boolean',
    default: true
  }).epilogue(`Also see the ${(0, _terminalLink.default)('RedwoodRecord Reference', 'https://redwoodjs.com/docs/redwoodrecord')}`);
  (0, _forEach.default)(_context = (0, _entries.default)(_helpers.yargsDefaults)).call(_context, ([option, config]) => {
    yargs.option(option, config);
  });
};
exports.builder = builder;
const handler = async ({
  force,
  ...args
}) => {
  var _context2;
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'generate model',
    force,
    rollback: args.rollback
  });
  (0, _helpers.validateName)(args.name);
  const tasks = new _listr.Listr((0, _filter.default)(_context2 = [{
    title: 'Generating model file...',
    task: () => {
      return (0, _lib.writeFilesTask)(files(args), {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Parsing datamodel, generating api/src/models/index.js...',
    task: async () => {
      const redwoodRecordModule = await import('@redwoodjs/record');
      await redwoodRecordModule.default.parseDatamodel();
    }
  }]).call(_context2, Boolean), {
    rendererOptions: {
      collapseSubtasks: false
    }
  });
  try {
    await (0, _schemaHelpers.verifyModelName)({
      name: args.name
    });
    if (args.rollback && !force) {
      (0, _rollback.prepareForRollback)(tasks);
    }
    await tasks.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
    process.exit(1);
  }
};
exports.handler = handler;