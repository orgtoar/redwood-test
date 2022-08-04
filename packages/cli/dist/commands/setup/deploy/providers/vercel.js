"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

var _helpers = require("../helpers");

// import terminalLink from 'terminal-link'
const command = 'vercel';
exports.command = command;
const description = 'Setup Vercel deploy';
exports.description = description;
const notes = ['You are ready to deploy to Vercel!', 'See: https://redwoodjs.com/docs/deploy#vercel-deploy'];

const handler = async () => {
  const tasks = new _listr.default([(0, _helpers.updateApiURLTask)('/api'), (0, _helpers.printSetupNotes)(notes)]);

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;