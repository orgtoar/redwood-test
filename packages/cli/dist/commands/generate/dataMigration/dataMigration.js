"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = exports.aliases = void 0;
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _paramCase = require("param-case");
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _rollback = require("../../../lib/rollback");
var _helpers = require("../helpers");
const POST_RUN_INSTRUCTIONS = `Next steps...\n\n   ${_colors.default.warning('After writing your migration, you can run it with:')}

     yarn rw dataMigrate up
`;
const TEMPLATE_PATHS = {
  js: _path.default.resolve(__dirname, 'templates', 'dataMigration.js.template'),
  ts: _path.default.resolve(__dirname, 'templates', 'dataMigration.ts.template')
};
const files = ({
  name,
  typescript
}) => {
  const now = new Date().toISOString();
  const timestamp = now.split('.')[0].replace(/\D/g, '');
  const basename = `${timestamp}-${(0, _paramCase.paramCase)(name)}`;
  const extension = typescript ? 'ts' : 'js';
  const outputFilename = basename + '.' + extension;
  const outputPath = _path.default.join((0, _lib.getPaths)().api.dataMigrations, outputFilename);
  return {
    [outputPath]: _fsExtra.default.readFileSync(TEMPLATE_PATHS[extension]).toString()
  };
};
exports.files = files;
const command = exports.command = 'data-migration <name>';
const aliases = exports.aliases = ['dataMigration', 'dm'];
const description = exports.description = 'Generate a data migration';
const builder = yargs => {
  var _context;
  yargs.positional('name', {
    description: 'A descriptor of what this data migration does',
    type: 'string'
  }).option('rollback', {
    description: 'Revert all generator actions if an error occurs',
    type: 'boolean',
    default: true
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-datamigration')}`);

  // Merge generator defaults in
  (0, _forEach.default)(_context = (0, _entries.default)(_helpers.yargsDefaults)).call(_context, ([option, config]) => {
    yargs.option(option, config);
  });
};
exports.builder = builder;
const handler = async args => {
  var _context2;
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'generate data-migration',
    force: args.force,
    rollback: args.rollback
  });
  (0, _helpers.validateName)(args.name);
  const tasks = new _listr.Listr((0, _filter.default)(_context2 = [{
    title: 'Generating data migration file...',
    task: () => {
      return (0, _lib.writeFilesTask)(files(args));
    }
  }, {
    title: 'Next steps...',
    task: (_ctx, task) => {
      task.title = POST_RUN_INSTRUCTIONS;
    }
  }]).call(_context2, Boolean), {
    rendererOptions: {
      collapseSubtasks: false
    }
  });
  try {
    if (args.rollback && !args.force) {
      (0, _rollback.prepareForRollback)(tasks);
    }
    await tasks.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
    process.exit(1);
  }
};
exports.handler = handler;