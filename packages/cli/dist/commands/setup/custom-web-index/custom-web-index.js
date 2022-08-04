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

const command = 'custom-web-index';
exports.command = command;
const description = 'Set up a custom index.js file, so you can customise how Redwood web is mounted in your browser';
exports.description = description;

const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing index.js file',
    type: 'boolean'
  });
};

exports.builder = builder;

const handler = async ({
  force
}) => {
  const tasks = new _listr.default([{
    title: 'Creating new entry point in `web/src/index.js`.',
    task: () => {
      var _getPaths$web$index;

      // @TODO figure out how we're handling typescript
      // In this file, we're setting everything to js
      // @Note, getPaths.web.index is null, when it doesn't exist
      const entryPointFile = (_getPaths$web$index = (0, _lib.getPaths)().web.index) !== null && _getPaths$web$index !== void 0 ? _getPaths$web$index : _path.default.join((0, _lib.getPaths)().web.src, 'index.js');
      return (0, _lib.writeFile)(entryPointFile, _fs.default.readFileSync(_path.default.join((0, _lib.getPaths)().base, // NOTE we're copying over the index.js before babel transform
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