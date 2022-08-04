"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../../lib");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

var _layer = require("../../../deploy/layer0");

var _helpers = require("../helpers");

const command = 'layer0';
exports.command = command;
const description = 'Setup Layer0 deploy';
exports.description = description;
const notes = ['You are almost ready to deploy to Layer0!', '', 'See https://redwoodjs.com/docs/deploy#layer0-deploy for the remaining', 'config and setup required before you can perform your first deploy.'];

const prismaBinaryTargetAdditions = () => {
  const content = _fs.default.readFileSync((0, _lib.getPaths)().api.dbSchema).toString();

  if (!content.includes('rhel-openssl-1.0.x')) {
    const result = content.replace(/binaryTargets =.*\n/, `binaryTargets = ["native", "rhel-openssl-1.0.x"]\n`);

    _fs.default.writeFileSync((0, _lib.getPaths)().api.dbSchema, result);
  }
};

const handler = async () => {
  const tasks = new _listr.default([(0, _helpers.addPackagesTask)({
    packages: ['@layer0/cli'],
    devDependency: true
  }), (0, _helpers.preRequisiteCheckTask)([{
    title: 'Checking if Layer0 is installed...',
    command: ['yarn', ['layer0', '--version']],
    errorMessage: _layer.ERR_MESSAGE_MISSING_CLI
  }, {
    title: 'Initializing with Layer0',
    command: ['yarn', ['layer0', 'init']],
    errorMessage: _layer.ERR_MESSAGE_NOT_INITIALIZED
  }]), {
    title: 'Adding necessary Prisma binaries...',
    task: () => prismaBinaryTargetAdditions()
  }, (0, _helpers.printSetupNotes)(notes)]);

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;