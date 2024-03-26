"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
require("core-js/modules/es.array.push.js");
var _execa = _interopRequireDefault(require("execa"));
var _listr = require("listr2");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../lib");
var _colors = _interopRequireDefault(require("../../lib/colors"));
var _setupInngest = require("./setupInngest");
var _util = require("./util");
const handler = async ({
  force
}) => {
  const tasks = new _listr.Listr([{
    title: `Adding Inngest setup packages for RedwoodJS ...`,
    task: async () => {
      await (0, _execa.default)('yarn', ['add', '-D', 'inngest-setup-redwoodjs'], {
        cwd: (0, _lib.getPaths)().base
      });
    }
  }, {
    task: async () => {
      const pluginCommands = ['inngest-setup-redwoodjs', 'plugin'];
      if (force) {
        pluginCommands.push('--force');
      }
      await (0, _execa.default)('yarn', [...pluginCommands], {
        stdout: 'inherit',
        cwd: (0, _lib.getPaths)().base
      });
    }
  }, {
    task: () => {
      (0, _util.printTaskEpilogue)(_setupInngest.command, _setupInngest.description, _setupInngest.EXPERIMENTAL_TOPIC_ID);
    }
  }]);
  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
};
exports.handler = handler;