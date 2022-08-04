"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ERR_MESSAGE_NOT_INITIALIZED = exports.ERR_MESSAGE_MISSING_CLI = void 0;
exports.buildErrorMessage = buildErrorMessage;
exports.handler = exports.description = exports.command = exports.builder = void 0;

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _omit = _interopRequireDefault(require("lodash/omit"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _paths = require("@redwoodjs/internal/dist/paths");

var _colors = _interopRequireDefault(require("../../lib/colors"));

var _helpers = require("./helpers/helpers");

const command = 'layer0 [...commands]';
exports.command = command;
const description = 'Build command for Layer0 deploy';
exports.description = description;

const builder = async yargs => {
  const {
    builder: layer0Builder
  } = require('@layer0/cli/commands/deploy');

  (0, _helpers.deployBuilder)(yargs);
  layer0Builder['skip-init'] = {
    type: 'boolean',
    description: ['Layer0 will attempt to initialize your project before deployment.', 'If your project has already been initialized and you wish to skip', 'this step, set this to `true`'].join(' '),
    default: false
  };
  yargs // allow Layer0 CLI options to pass through
  .options(layer0Builder).group(Object.keys((0, _omit.default)(layer0Builder, ['skip-init'])), 'Layer0 deploy options:');
};

exports.builder = builder;
const execaOptions = {
  cwd: _path.default.join((0, _paths.getPaths)().base),
  shell: true,
  stdio: 'inherit',
  cleanup: true
};

const handler = async args => {
  const {
    builder: layer0Builder
  } = require('@layer0/cli/commands/deploy');

  const cwd = _path.default.join((0, _paths.getPaths)().base);

  try {
    // check that Layer0 is setup in the project
    await (0, _execa.default)('yarn', ['layer0', '--version'], execaOptions);
  } catch (e) {
    logAndExit(ERR_MESSAGE_MISSING_CLI);
  } // check that the project has been already been initialized.
  // if not, we will run init automatically unless specified by arg


  const configExists = await _fsExtra.default.pathExists(_path.default.join(cwd, 'layer0.config.js'));

  if (!configExists) {
    if (args.skipInit) {
      logAndExit(ERR_MESSAGE_NOT_INITIALIZED);
    }

    await (0, _execa.default)('yarn', ['layer0', 'init'], execaOptions);
  }

  await (0, _helpers.deployHandler)(args); // construct args for deploy command

  const deployArgs = Object.keys(layer0Builder).reduce((acc, key) => {
    if (args[key]) {
      acc.push(`--${key}=${args[key]}`);
    }

    return acc;
  }, []); // Even if rw builds the project, we still need to run the build for Layer0
  // to bundle the router so we just skip the framework build.
  //
  //    --skip-framework (layer0 build):
  //      skips the framework build, but bundles the router and
  //      assets for deployment
  //
  //    --skip-build (layer0 deploy):
  //      skips the whole build process during deploy; user may
  //      opt out of this if they already did a build and just
  //      want to deploy
  // User must explicitly pass `--skip-build` during deploy in order to
  // skip bundling the router.

  if (!args.skipBuild) {
    deployArgs.push('--skip-build');
    await (0, _execa.default)('yarn', ['layer0', 'build', '--skip-framework'], execaOptions);
  }

  await (0, _execa.default)('yarn', ['layer0', 'deploy', ...deployArgs], execaOptions);
};

exports.handler = handler;
const ERR_MESSAGE_MISSING_CLI = buildErrorMessage('Layer0 not found!', ['It looks like Layer0 is not configured for your project.', 'Run the following to add Layer0 to your project:', `  ${_colors.default.info('yarn add -D @layer0/cli')}`].join('\n'));
exports.ERR_MESSAGE_MISSING_CLI = ERR_MESSAGE_MISSING_CLI;
const ERR_MESSAGE_NOT_INITIALIZED = buildErrorMessage('Layer0 not initialized!', ['It looks like Layer0 is not configured for your project.', 'Run the following to initialize Layer0 on your project:', `  ${_colors.default.info('yarn layer0 init')}`].join('\n'));
exports.ERR_MESSAGE_NOT_INITIALIZED = ERR_MESSAGE_NOT_INITIALIZED;

function buildErrorMessage(title, message) {
  return [_colors.default.bold(_colors.default.error(title)), '', message, '', `Also see the ${(0, _terminalLink.default)('RedwoodJS on Layer0 Guide', 'https://docs.layer0.co/guides/redwoodjs')} for additional resources.`, ''].join('\n');
}

function logAndExit(message) {
  console.log(message);
  process.exit(1);
}