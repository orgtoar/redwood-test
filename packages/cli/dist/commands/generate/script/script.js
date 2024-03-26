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
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _rollback = require("../../../lib/rollback");
var _helpers = require("../helpers");
const TEMPLATE_PATH = _path.default.resolve(__dirname, 'templates', 'script.js.template');
const TSCONFIG_TEMPLATE = _path.default.resolve(__dirname, 'templates', 'tsconfig.json.template');
const files = ({
  name,
  typescript = false
}) => {
  const outputFilename = `${name}.${typescript ? 'ts' : 'js'}`;
  const outputPath = _path.default.join((0, _lib.getPaths)().scripts, outputFilename);
  const scriptTsConfigPath = _path.default.join((0, _lib.getPaths)().scripts, 'tsconfig.json');
  return {
    [outputPath]: _fsExtra.default.readFileSync(TEMPLATE_PATH, 'utf-8'),
    // Add tsconfig for type and cmd+click support if project is TS
    ...(typescript && !_fsExtra.default.existsSync(scriptTsConfigPath) && {
      [scriptTsConfigPath]: _fsExtra.default.readFileSync(TSCONFIG_TEMPLATE, 'utf-8')
    })
  };
};
exports.files = files;
const command = exports.command = 'script <name>';
const description = exports.description = 'Generate a command line script';
const builder = yargs => {
  var _context;
  yargs.positional('name', {
    description: 'A descriptor of what this script does',
    type: 'string'
  }).option('rollback', {
    description: 'Revert all generator actions if an error occurs',
    type: 'boolean',
    default: true
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-script')}`);
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
    command: 'generate script',
    force,
    rollback: args.rollback
  });
  const POST_RUN_INSTRUCTIONS = `Next steps...\n\n   ${_colors.default.warning('After modifying your script, you can invoke it like:')}

     yarn rw exec ${args.name}

     yarn rw exec ${args.name} --param1 true
`;
  (0, _helpers.validateName)(args.name);
  const tasks = new _listr.Listr((0, _filter.default)(_context2 = [{
    title: 'Generating script file...',
    task: () => {
      return (0, _lib.writeFilesTask)(files(args), {
        overwriteExisting: force
      });
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
    if (args.rollback && !force) {
      (0, _rollback.prepareForRollback)(tasks);
    }
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.log(_colors.default.error(e.message));
    process.exit(1);
  }
};
exports.handler = handler;