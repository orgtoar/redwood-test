"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _chalk = _interopRequireDefault(require("chalk"));

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

const command = 'webpack';
exports.command = command;
const description = 'Set up webpack in your project so you can add custom config';
exports.description = description;

const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  });
};

exports.builder = builder;

const handler = async ({
  force
}) => {
  const tasks = new _listr.default([{
    title: 'Adding webpack file to your web folder...',
    task: () => {
      const webpackConfigFile = `${(0, _lib.getPaths)().web.config}/webpack.config.js`;
      return (0, _lib.writeFile)(webpackConfigFile, _fs.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'webpack.config.js.template')).toString(), {
        overwriteExisting: force
      });
    }
  }, {
    title: 'One more thing...',
    task: (_ctx, task) => {
      task.title = `One more thing...\n
          ${_colors.default.green('Quick link to the docs on configuring custom webpack config:')}
          ${_chalk.default.hex('#e8e8e8')('https://redwoodjs.com/docs/webpack-configuration#configuring-webpack')}
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