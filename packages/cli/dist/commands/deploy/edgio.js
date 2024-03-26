"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.ERR_MESSAGE_NOT_INITIALIZED = exports.ERR_MESSAGE_MISSING_CLI = void 0;
exports.buildErrorMessage = buildErrorMessage;
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
require("core-js/modules/es.array.push.js");
require("core-js/modules/esnext.array.group.js");
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _lodash = require("lodash");
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
var _colors = _interopRequireDefault(require("../../lib/colors"));
var _helpers = require("./helpers/helpers");
const command = exports.command = 'edgio [...commands]';
const description = exports.description = 'Build command for Edgio deploy';
const builder = async yargs => {
  const {
    builder: edgioBuilder
  } = require('@edgio/cli/commands/deploy');
  (0, _helpers.deployBuilder)(yargs);
  edgioBuilder['skip-init'] = {
    type: 'boolean',
    description: ['Edgio will attempt to initialize your project before deployment.', 'If your project has already been initialized and you wish to skip', 'this step, set this to `true`'].join(' '),
    default: false
  };
  yargs
  // allow Edgio CLI options to pass through
  .options(edgioBuilder).group((0, _keys.default)((0, _lodash.omit)(edgioBuilder, ['skip-init'])), 'Edgio deploy options:');
};
exports.builder = builder;
const execaOptions = {
  cwd: _path.default.join((0, _projectConfig.getPaths)().base),
  shell: true,
  stdio: 'inherit',
  cleanup: true
};
const handler = async args => {
  var _context;
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'deploy edgio',
    skipInit: args.skipInit,
    build: args.build,
    prisma: args.prisma,
    dataMigrate: args.dataMigrate
  });
  const {
    builder: edgioBuilder
  } = require('@edgio/cli/commands/deploy');
  const cwd = _path.default.join((0, _projectConfig.getPaths)().base);
  try {
    // check that Edgio is setup in the project
    await (0, _execa.default)('yarn', ['edgio', '--version'], execaOptions);
  } catch (e) {
    logAndExit(ERR_MESSAGE_MISSING_CLI);
  }

  // check that the project has been already been initialized.
  // if not, we will run init automatically unless specified by arg
  const configExists = await _fsExtra.default.pathExists(_path.default.join(cwd, 'edgio.config.js'));
  if (!configExists) {
    if (args.skipInit) {
      logAndExit(ERR_MESSAGE_NOT_INITIALIZED);
    }
    await (0, _execa.default)('yarn', ['edgio', 'init'], execaOptions);
  }
  await (0, _helpers.deployHandler)(args);

  // construct args for deploy command
  const deployArgs = (0, _reduce.default)(_context = (0, _keys.default)(edgioBuilder)).call(_context, (acc, key) => {
    if (args[key]) {
      acc.push(`--${key}=${args[key]}`);
    }
    return acc;
  }, []);

  // Even if rw builds the project, we still need to run the build for Edgio
  // to bundle the router so we just skip the framework build.
  //
  //    --skip-framework (edgio build):
  //      skips the framework build, but bundles the router and
  //      assets for deployment
  //
  //    --skip-build (edgio deploy):
  //      skips the whole build process during deploy; user may
  //      opt out of this if they already did a build and just
  //      want to deploy

  // User must explicitly pass `--skip-build` during deploy in order to
  // skip bundling the router.
  if (!args.skipBuild) {
    deployArgs.push('--skip-build');
    await (0, _execa.default)('yarn', ['edgio', 'build', '--skip-framework'], execaOptions);
  }
  await (0, _execa.default)('yarn', ['edgio', 'deploy', ...deployArgs], execaOptions);
};
exports.handler = handler;
const ERR_MESSAGE_MISSING_CLI = exports.ERR_MESSAGE_MISSING_CLI = buildErrorMessage('Edgio not found!', ['It looks like Edgio is not configured for your project.', 'Run the following to add Edgio to your project:', `  ${_colors.default.info('yarn add -D @edgio/cli')}`].join('\n'));
const ERR_MESSAGE_NOT_INITIALIZED = exports.ERR_MESSAGE_NOT_INITIALIZED = buildErrorMessage('Edgio not initialized!', ['It looks like Edgio is not configured for your project.', 'Run the following to initialize Edgio on your project:', `  ${_colors.default.info('yarn edgio init')}`].join('\n'));
function buildErrorMessage(title, message) {
  return [_colors.default.bold(_colors.default.error(title)), '', message, '', `Also see the ${(0, _terminalLink.default)('RedwoodJS on Edgio Guide', 'https://docs.edg.io/guides/redwoodjs')} for additional resources.`, ''].join('\n');
}
function logAndExit(message) {
  console.log(message);
  process.exit(1);
}