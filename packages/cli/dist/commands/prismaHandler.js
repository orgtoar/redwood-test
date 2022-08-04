"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _boxen = _interopRequireDefault(require("boxen"));

var _execa = _interopRequireDefault(require("execa"));

var _telemetry = require("@redwoodjs/telemetry");

var _colors = _interopRequireDefault(require("../lib/colors"));

var _index = require("../lib/index");

// eslint-disable-next-line no-unused-vars
const handler = async ({
  _,
  $0,
  commands = [],
  ...options
}) => {
  const rwjsPaths = (0, _index.getPaths)(); // Prisma only supports '--help', but Redwood CLI supports `prisma <command> help`

  const helpIndex = commands.indexOf('help');

  if (helpIndex !== -1) {
    options.help = true;
    commands.splice(helpIndex, 1);
  } // Automatically inject options for some commands.


  const hasHelpOption = options.help || options.h;

  if (!hasHelpOption) {
    if (['generate', 'introspect', 'db', 'migrate', 'studio', 'format'].includes(commands[0])) {
      if (!_fs.default.existsSync(rwjsPaths.api.dbSchema)) {
        console.error();
        console.error(_colors.default.error('No Prisma Schema found.'));
        console.error(`Redwood searched here '${rwjsPaths.api.dbSchema}'`);
        console.error();
        process.exit(1);
      }

      options.schema = `${rwjsPaths.api.dbSchema}`;

      if (['seed', 'diff'].includes(commands[1])) {
        delete options.schema;
      }
    }
  } // Convert command and options into a string that's run via execa


  const args = commands;

  for (const [name, value] of Object.entries(options)) {
    // Allow both long and short form commands, e.g. --name and -n
    args.push(name.length > 1 ? `--${name}` : `-${name}`);

    if (typeof value !== 'boolean') {
      // Make sure options that take multiple quoted words
      // like `-n "create user"` are passed to prisma with quotes.
      value.split(' ').length > 1 ? args.push(`"${value}"`) : args.push(value);
    }
  }

  console.log();
  console.log(_colors.default.green('Running Prisma CLI...'));
  console.log(_colors.default.underline('$ yarn prisma ' + args.join(' ')));
  console.log();

  try {
    _execa.default.sync(`"${_path.default.join(rwjsPaths.base, 'node_modules/.bin/prisma')}"`, args, {
      shell: true,
      cwd: rwjsPaths.base,
      stdio: 'inherit',
      cleanup: true
    });

    if (hasHelpOption || commands.length === 0) {
      printWrapInfo();
    }
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, `Error generating prisma client: ${e.message}`);
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;

const printWrapInfo = () => {
  const message = [_colors.default.bold('Redwood CLI wraps Prisma CLI'), '', 'Use `yarn rw prisma` to automatically pass `--schema` and `--preview-feature` options.', 'Use `yarn prisma` to skip Redwood CLI automatic options.', '', 'Find more information in our docs:', _colors.default.underline('https://redwoodjs.com/docs/cli-commands#prisma')];
  console.log((0, _boxen.default)(message.join('\n'), {
    padding: {
      top: 0,
      bottom: 0,
      right: 1,
      left: 1
    },
    margin: 1,
    borderColor: 'gray'
  }));
};