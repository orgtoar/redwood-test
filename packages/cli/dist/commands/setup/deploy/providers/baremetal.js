"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.configFilename = exports.command = void 0;
var _path = _interopRequireDefault(require("path"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../../lib");
var _colors = _interopRequireDefault(require("../../../../lib/colors"));
var _helpers = require("../helpers");
var _baremetal = require("../templates/baremetal");
// import terminalLink from 'terminal-link'

const command = exports.command = 'baremetal';
const description = exports.description = 'Setup Baremetal deploy';
const configFilename = exports.configFilename = 'deploy.toml';
const files = [{
  path: _path.default.join((0, _lib.getPaths)().base, configFilename),
  content: _baremetal.DEPLOY
}, {
  path: _path.default.join((0, _lib.getPaths)().base, 'ecosystem.config.js'),
  content: _baremetal.ECOSYSTEM
}, {
  path: _path.default.join((0, _lib.getPaths)().web.src, 'maintenance.html'),
  content: _baremetal.MAINTENANCE
}];
const notes = ['You are almost ready to go BAREMETAL!', '', 'See https://redwoodjs.com/docs/deploy/baremetal for the remaining', 'config and setup required before you can perform your first deploy.'];
const handler = async ({
  force
}) => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup deploy baremetal',
    force
  });
  const tasks = new _listr.Listr([(0, _lib.addPackagesTask)({
    packages: ['node-ssh'],
    devDependency: true
  }), (0, _helpers.addFilesTask)({
    files,
    force
  }), (0, _lib.printSetupNotes)(notes)], {
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