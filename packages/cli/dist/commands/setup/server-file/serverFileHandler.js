"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = handler;
exports.setupServerFileTasks = setupServerFileTasks;
require("core-js/modules/esnext.json.parse.js");
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _project = require("../../../lib/project");
const {
  version
} = JSON.parse(_fsExtra.default.readFileSync(_path.default.resolve(__dirname, '../../../../package.json'), 'utf-8'));
function setupServerFileTasks({
  force = false
} = {}) {
  return [{
    title: 'Adding the server file...',
    task: () => {
      const ts = (0, _project.isTypeScriptProject)();
      const serverFilePath = _path.default.join((0, _lib.getPaths)().api.src, `server.${ts ? 'ts' : 'js'}`);
      const serverFileTemplateContent = _fsExtra.default.readFileSync(_path.default.join(__dirname, 'templates', 'server.ts.template'), 'utf-8');
      const setupScriptContent = ts ? serverFileTemplateContent : (0, _lib.transformTSToJS)(serverFilePath, serverFileTemplateContent);
      return [(0, _lib.writeFile)(serverFilePath, setupScriptContent, {
        overwriteExisting: force
      })];
    }
  }, (0, _cliHelpers.addApiPackages)([`@redwoodjs/api-server@${version}`])];
}
async function handler({
  force,
  verbose
}) {
  const tasks = new _listr.Listr(setupServerFileTasks({
    force
  }), {
    rendererOptions: {
      collapseSubtasks: false,
      persistentOutput: true
    },
    renderer: verbose ? 'verbose' : 'default'
  });
  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
}