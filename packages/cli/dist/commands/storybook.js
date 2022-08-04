"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = exports.aliases = void 0;

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _paths = require("@redwoodjs/internal/dist/paths");

var _telemetry = require("@redwoodjs/telemetry");

var _colors = _interopRequireDefault(require("../lib/colors"));

const command = 'storybook';
exports.command = command;
const aliases = ['sb'];
exports.aliases = aliases;
const description = 'Launch Storybook: a tool for building UI components and pages in isolation';
exports.description = description;

const builder = yargs => {
  yargs.option('open', {
    describe: 'Open storybooks in your browser on start',
    type: 'boolean',
    default: true
  }).option('build', {
    describe: 'Build Storybook',
    type: 'boolean',
    default: false
  }).option('ci', {
    describe: 'Start server in CI mode, with no interactive prompts',
    type: 'boolean',
    default: false
  }).option('port', {
    describe: 'Which port to run storybooks on',
    type: 'integer',
    default: 7910
  }).option('build-directory', {
    describe: 'Directory in web/ to store static files',
    type: 'string',
    default: 'public/storybook'
  }).option('manager-cache', {
    describe: "Cache the manager UI. Disable this when you're making changes to `storybook.manager.js`.",
    type: 'boolean',
    default: true
  }).option('smoke-test', {
    describe: "CI mode plus Smoke-test (skip prompts, don't open browser, exit after successful start)",
    type: 'boolean',
    default: false
  }).check(argv => {
    if (argv.build && argv.smokeTest) {
      throw new Error('Can not provide both "--build" and "--smoke-test"');
    }

    if (argv.build && argv.open) {
      console.warn(_colors.default.warning('Warning: --open option has no effect when running Storybook build'));
    }

    return true;
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#storybook')}`);
};

exports.builder = builder;

const handler = ({
  open,
  port,
  build,
  ci,
  buildDirectory,
  managerCache,
  smokeTest
}) => {
  const cwd = (0, _paths.getPaths)().web.base;

  const staticAssetsFolder = _path.default.join((0, _paths.getPaths)().web.base, 'public'); // Create the `MockServiceWorker.js` file
  // https://mswjs.io/docs/cli/init


  (0, _execa.default)(`yarn msw init "${staticAssetsFolder}" --no-save`, undefined, {
    stdio: 'inherit',
    shell: true,
    cwd
  });

  const storybookConfig = _path.default.dirname(require.resolve('@redwoodjs/testing/config/storybook/main.js'));

  try {
    if (build) {
      var _context;

      (0, _execa.default)(`yarn build-storybook`, (0, _filter.default)(_context = [`--config-dir "${storybookConfig}"`, `--output-dir "${buildDirectory}"`, !managerCache && `--no-manager-cache`]).call(_context, Boolean), {
        stdio: 'inherit',
        shell: true,
        cwd
      });
    } else if (smokeTest) {
      var _context2;

      (0, _execa.default)(`yarn start-storybook`, (0, _filter.default)(_context2 = [`--config-dir "${storybookConfig}"`, `--port ${port}`, `--smoke-test`, `--ci`, `--no-version-updates`]).call(_context2, Boolean), {
        stdio: 'inherit',
        shell: true,
        cwd
      });
    } else {
      var _context3;

      (0, _execa.default)(`yarn start-storybook`, (0, _filter.default)(_context3 = [`--config-dir "${storybookConfig}"`, `--port ${port}`, !managerCache && `--no-manager-cache`, `--no-version-updates`, ci && '--ci', !open && `--no-open`]).call(_context3, Boolean), {
        stdio: 'inherit',
        shell: true,
        cwd
      });
    }
  } catch (e) {
    console.log(_colors.default.error(e.message));
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    process.exit(1);
  }
};

exports.handler = handler;