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

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _generate = require("../../generate");

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
    [outputPath]: _fs.default.readFileSync(TEMPLATE_PATH, 'utf-8'),
    // Add tsconfig for type and cmd+click support if project is TS
    ...(typescript && !_fs.default.existsSync(scriptTsConfigPath) && {
      [scriptTsConfigPath]: _fs.default.readFileSync(TSCONFIG_TEMPLATE, 'utf-8')
    })
  };
};

exports.files = files;
const command = 'script <name>';
exports.command = command;
const description = 'Generate a command line script';
exports.description = description;

const builder = yargs => {
  var _context;

  yargs.positional('name', {
    description: 'A descriptor of what this script does',
    type: 'string'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-script')}`);
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

  const POST_RUN_INSTRUCTIONS = `Next steps...\n\n   ${_colors.default.warning('After modifying your script, you can invoke it like:')}

     yarn rw exec ${args.name}

     yarn rw exec ${args.name} --param1 true
`;
  const tasks = new _listr.default((0, _filter.default)(_context2 = [{
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
    collapse: false
  });

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.log(_colors.default.error(e.message));
    process.exit(1);
  }
};

exports.handler = handler;