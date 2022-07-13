"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = void 0;

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../../lib");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

var _helpers = require("../helpers");

var _netlify = require("../templates/netlify");

// import terminalLink from 'terminal-link'
const command = 'netlify';
exports.command = command;
const description = 'Setup Netlify deploy';
exports.description = description;
const files = [{
  path: _path.default.join((0, _lib.getPaths)().base, 'netlify.toml'),
  content: _netlify.NETLIFY_TOML
}];
const notes = ['You are ready to deploy to Netlify!', 'See: https://redwoodjs.com/docs/deploy#netlify-deploy'];

const handler = async ({
  force
}) => {
  const tasks = new _listr.default([(0, _helpers.updateApiURLTask)('/.netlify/functions'), (0, _helpers.addFilesTask)({
    files,
    force
  }), (0, _helpers.printSetupNotes)(notes)]);

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;