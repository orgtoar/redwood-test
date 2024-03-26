"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _path = _interopRequireDefault(require("path"));
var _chalk = _interopRequireDefault(require("chalk"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _project = require("../../../lib/project");
const CLIENT_PACKAGE_MAP = {
  memcached: 'memjs',
  redis: 'redis'
};
const CLIENT_HOST_MAP = {
  memcached: 'localhost:11211',
  redis: 'redis://localhost:6379'
};
const handler = async ({
  client,
  force
}) => {
  const extension = _project.isTypeScriptProject ? 'ts' : 'js';
  const tasks = new _listr.Listr([(0, _lib.addPackagesTask)({
    packages: [CLIENT_PACKAGE_MAP[client]],
    side: 'api'
  }), {
    title: `Writing api/src/lib/cache.js`,
    task: () => {
      const template = _fsExtra.default.readFileSync(_path.default.join(__dirname, 'templates', `${client}.ts.template`)).toString();
      return (0, _lib.writeFile)(_path.default.join((0, _lib.getPaths)().api.lib, `cache.${extension}`), template, {
        overwriteExisting: force
      });
    }
  }, (0, _cliHelpers.addEnvVarTask)('CACHE_HOST', CLIENT_HOST_MAP[client], `Where your ${client} server lives for service caching`), {
    title: 'One more thing...',
    task: (_ctx, task) => {
      task.title = `One more thing...\n
          ${_colors.default.green('Check out the Service Cache docs for config and usage:')}
          ${_chalk.default.hex('#e8e8e8')('https://redwoodjs.com/docs/services#caching')}
        `;
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