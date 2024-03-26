"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../../lib");
var _colors = _interopRequireDefault(require("../../../../lib/colors"));
var _edgio = require("../../../deploy/edgio");
var _helpers = require("../helpers");
const command = exports.command = 'edgio';
const description = exports.description = 'Setup Edgio deploy';
const notes = ['You are almost ready to deploy to Edgio!', '', 'See https://redwoodjs.com/docs/deploy#edgio-deploy for the remaining', 'config and setup required before you can perform your first deploy.'];
const prismaBinaryTargetAdditions = () => {
  const content = _fsExtra.default.readFileSync((0, _lib.getPaths)().api.dbSchema).toString();
  if (!(0, _includes.default)(content).call(content, 'rhel-openssl-1.0.x')) {
    const result = content.replace(/binaryTargets =.*\n/, `binaryTargets = ["native", "rhel-openssl-1.0.x"]\n`);
    _fsExtra.default.writeFileSync((0, _lib.getPaths)().api.dbSchema, result);
  }
};
const handler = async () => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup deploy edgio'
  });
  const tasks = new _listr.Listr([(0, _lib.addPackagesTask)({
    packages: ['@edgio/cli'],
    devDependency: true
  }), (0, _helpers.preRequisiteCheckTask)([{
    title: 'Checking if Edgio is installed...',
    command: ['yarn', ['edgio', '--version']],
    errorMessage: _edgio.ERR_MESSAGE_MISSING_CLI
  }, {
    title: 'Initializing with Edgio',
    command: ['yarn', ['edgio', 'init']],
    errorMessage: _edgio.ERR_MESSAGE_NOT_INITIALIZED
  }]), {
    title: 'Adding necessary Prisma binaries...',
    task: () => prismaBinaryTargetAdditions()
  }, (0, _lib.printSetupNotes)(notes)], {
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