"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../../lib");
var _colors = _interopRequireDefault(require("../../../../lib/colors"));
var _helpers = require("../helpers");
// import terminalLink from 'terminal-link'

const command = exports.command = 'vercel';
const description = exports.description = 'Setup Vercel deploy';
const notes = ['You are ready to deploy to Vercel!', 'See: https://redwoodjs.com/docs/deploy#vercel-deploy'];
const handler = async () => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup deploy vercel'
  });
  const tasks = new _listr.Listr([(0, _helpers.updateApiURLTask)('/api'), (0, _lib.printSetupNotes)(notes)], {
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