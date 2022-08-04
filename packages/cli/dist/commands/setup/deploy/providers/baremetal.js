"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.configFilename = exports.command = void 0;

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../../lib");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

var _helpers = require("../helpers");

var _baremetal = require("../templates/baremetal");

// import terminalLink from 'terminal-link'
const command = 'baremetal';
exports.command = command;
const description = 'Setup Baremetal deploy';
exports.description = description;
const configFilename = 'deploy.toml';
exports.configFilename = configFilename;
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
  const tasks = new _listr.default([(0, _helpers.addPackagesTask)({
    packages: ['node-ssh'],
    devDependency: true
  }), (0, _helpers.addFilesTask)({
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