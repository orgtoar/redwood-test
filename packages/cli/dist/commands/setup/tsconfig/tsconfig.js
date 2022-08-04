"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;

var _path = _interopRequireDefault(require("path"));

var _chalk = _interopRequireDefault(require("chalk"));

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

const command = 'tsconfig';
exports.command = command;
const description = 'Set up tsconfig for web and api sides';
exports.description = description;

const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing tsconfig.json files',
    type: 'boolean'
  });
};

exports.builder = builder;

const handler = async ({
  force
}) => {
  const installedRwVersion = (0, _lib.getInstalledRedwoodVersion)();
  const GITHUB_VERSION_TAG = installedRwVersion.match('canary') ? 'main' : `v${installedRwVersion}`;
  const CRWA_TEMPLATE_URL = `https://raw.githubusercontent.com/redwoodjs/redwood/${GITHUB_VERSION_TAG}/packages/create-redwood-app/template`;
  const tasks = new _listr.default([{
    title: 'Creating tsconfig in web',
    task: () => {
      const webConfigPath = _path.default.join((0, _lib.getPaths)().web.base, 'tsconfig.json');

      const templateUrl = `${CRWA_TEMPLATE_URL}/web/tsconfig.json`;
      return (0, _lib.saveRemoteFileToDisk)(templateUrl, webConfigPath, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Creating tsconfig in api',
    task: () => {
      const webConfigPath = _path.default.join((0, _lib.getPaths)().api.base, 'tsconfig.json');

      const templateUrl = `${CRWA_TEMPLATE_URL}/api/tsconfig.json`;
      return (0, _lib.saveRemoteFileToDisk)(templateUrl, webConfigPath, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'One more thing...',
    task: (_ctx, task) => {
      task.title = `One more thing...\n
          ${_colors.default.green('Quick link to the docs on configuring TypeScript')}
          ${_chalk.default.hex('#e8e8e8')('https://redwoodjs.com/docs/typescript')}
        `;
    }
  }]);

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;