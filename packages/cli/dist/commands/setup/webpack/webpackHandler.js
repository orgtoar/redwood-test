"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _path = _interopRequireDefault(require("path"));
var _chalk = _interopRequireDefault(require("chalk"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
const handler = async ({
  force
}) => {
  const tasks = new _listr.Listr([{
    title: 'Adding webpack file to your web folder...',
    task: () => {
      const webpackConfigFile = `${(0, _lib.getPaths)().web.config}/webpack.config.js`;
      return (0, _lib.writeFile)(webpackConfigFile, _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'webpack.config.js.template')).toString(), {
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
  }], {
    rendererOptions: {
      collapseSubtasks: false
    }
  });
  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
};
exports.handler = handler;