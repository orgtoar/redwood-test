"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.deployHandler = exports.deployBuilder = void 0;

var _execa = _interopRequireDefault(require("execa"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _internal = require("@redwoodjs/internal");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

const deployBuilder = yargs => {
  yargs.option('build', {
    description: 'Build for production',
    type: 'boolean',
    default: 'true'
  }).option('prisma', {
    description: 'Apply database migrations',
    type: 'boolean',
    default: 'true'
  }).option('data-migrate', {
    description: 'Migrate the data in your database',
    type: 'boolean',
    default: 'true',
    alias: 'dm'
  }).epilogue(`For more commands, options, and examples, see ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#deploy')}`);
};

exports.deployBuilder = deployBuilder;

const deployHandler = async ({
  build,
  prisma,
  dm: dataMigrate
}) => {
  const paths = (0, _internal.getPaths)();
  let commandSet = [];

  if (build) {
    commandSet.push('yarn rw build --verbose');
  }

  if (prisma) {
    commandSet.push('yarn rw prisma migrate deploy');
  }

  if (dataMigrate) {
    commandSet.push('yarn rw data-migrate up');
  }

  const joinedCommands = commandSet.join(' && ');
  console.log(_colors.default.green(`\nRunning:\n`) + `${joinedCommands} \n`);
  return (0, _execa.default)(joinedCommands, {
    shell: true,
    stdio: 'inherit',
    cwd: paths.base,
    extendEnv: true,
    cleanup: true
  });
};

exports.deployHandler = deployHandler;