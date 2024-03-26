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
  if ((0, _lib.getPaths)().web.viteConfig) {
    console.warn(_colors.default.warning('Warning: This command only applies to projects using webpack'));
    return;
  }
  const tasks = new _listr.Listr([{
    title: 'Creating new entry point in `web/src/index.js`.',
    task: () => {
      // @TODO figure out how we're handling typescript
      // In this file, we're setting everything to js
      // @Note, getPaths.web.index is null, when it doesn't exist
      const entryPointFile = (0, _lib.getPaths)().web.index ?? _path.default.join((0, _lib.getPaths)().web.src, 'index.js');
      return (0, _lib.writeFile)(entryPointFile, _fsExtra.default.readFileSync(_path.default.join((0, _lib.getPaths)().base,
      // NOTE we're copying over the index.js before babel transform
      'node_modules/@redwoodjs/web/src/entry/index.js')).toString().replace('~redwood-app-root', './App'), {
        overwriteExisting: force
      });
    }
  }, {
    title: 'One more thing...',
    task: (_ctx, task) => {
      task.title = `One more thing...\n
          ${_colors.default.green('Quick link to the docs on configuring a custom entry point for your RW app')}
          ${_chalk.default.hex('#e8e8e8')('https://redwoodjs.com/docs/custom-web-index')}
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