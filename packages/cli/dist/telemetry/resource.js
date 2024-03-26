"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.getResources = getResources;
require("core-js/modules/es.array.push.js");
require("core-js/modules/esnext.json.parse.js");
var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _path = _interopRequireDefault(require("path"));
var _semanticConventions = require("@opentelemetry/semantic-conventions");
var _ciInfo = _interopRequireDefault(require("ci-info"));
var _envinfo = _interopRequireDefault(require("envinfo"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _systeminformation = _interopRequireDefault(require("systeminformation"));
var _uuid = require("uuid");
var _projectConfig = require("@redwoodjs/project-config");
var _hosts = require("@redwoodjs/structure/dist/hosts");
var _RWProject = require("@redwoodjs/structure/dist/model/RWProject");
var _package = require("../../package");
async function getResources() {
  var _context;
  // Read the UUID from the file within .redwood or generate a new one if it doesn't exist
  // or if it is too old
  let UID = (0, _uuid.v4)();
  try {
    const telemetryFile = _path.default.join((0, _projectConfig.getPaths)().generated.base, 'telemetry.txt');
    if (!_fsExtra.default.existsSync(telemetryFile)) {
      _fsExtra.default.ensureFileSync(telemetryFile);
    }
    if (_fsExtra.default.statSync(telemetryFile).mtimeMs < (0, _now.default)() - 86400000) {
      // 86400000 is 24 hours in milliseconds, we rotate the UID every 24 hours
      _fsExtra.default.writeFileSync(telemetryFile, UID);
    } else {
      const storedUID = _fsExtra.default.readFileSync(telemetryFile, {
        encoding: 'utf8'
      });
      if (storedUID && (0, _uuid.validate)(storedUID)) {
        UID = storedUID;
      } else {
        _fsExtra.default.writeFileSync(telemetryFile, UID);
      }
    }
  } catch (_error) {
    // We can ignore any errors here, we'll just use the generated UID in this case
  }
  const info = JSON.parse(await _envinfo.default.run({
    System: ['OS', 'Shell'],
    Binaries: ['Node', 'Yarn', 'npm'],
    npmPackages: '@redwoodjs/*',
    IDEs: ['VSCode']
  }, {
    json: true
  }));

  // get shell name instead of path
  const shell = info.System?.Shell; // Windows doesn't always provide shell info, I guess
  if (shell?.path?.match('/')) {
    info.System.Shell.name = info.System.Shell.path.split('/').pop();
  } else if (shell?.path.match('\\')) {
    info.System.Shell.name = info.System.Shell.path.split('\\').pop();
  }
  const cpu = await _systeminformation.default.cpu();
  const mem = await _systeminformation.default.mem();

  // Record any specific development environment
  let developmentEnvironment = undefined;
  // Gitpod
  if ((0, _some.default)(_context = (0, _keys.default)(process.env)).call(_context, key => (0, _startsWith.default)(key).call(key, 'GITPOD_'))) {
    developmentEnvironment = 'gitpod';
  }

  // Must only call getConfig() once the project is setup - so not within telemetry for CRWA
  // Default to 'webpack' for new projects
  const webBundler = (0, _projectConfig.getConfig)().web.bundler;

  // Returns a list of all enabled experiments
  // This detects all top level [experimental.X] and returns all X's, ignoring all Y's for any [experimental.X.Y]
  const experiments = (0, _keys.default)((0, _projectConfig.getRawConfig)()['experimental'] || {});

  // NOTE: Added this way to avoid the need to disturb the existing toml structure
  if (webBundler !== 'webpack') {
    experiments.push(webBundler);
  }

  // Project complexity metric
  const project = new _RWProject.RWProject({
    host: new _hosts.DefaultHost(),
    projectRoot: (0, _projectConfig.getPaths)().base
  });
  const routes = project.getRouter().routes;
  const prerenderedRoutes = (0, _filter.default)(routes).call(routes, route => route.hasPrerender);
  const complexity = [routes.length, prerenderedRoutes.length, project.services.length, project.cells.length, project.pages.length].join('.');
  const sides = project.sides.join(',');
  return {
    [_semanticConventions.SemanticResourceAttributes.SERVICE_NAME]: _package.name,
    [_semanticConventions.SemanticResourceAttributes.SERVICE_VERSION]: _package.version,
    [_semanticConventions.SemanticResourceAttributes.OS_TYPE]: info.System?.OS?.split(' ')[0],
    [_semanticConventions.SemanticResourceAttributes.OS_VERSION]: info.System?.OS?.split(' ')[1],
    'shell.name': info.System?.Shell?.name,
    'node.version': info.Binaries?.Node?.version,
    'yarn.version': info.Binaries?.Yarn?.version,
    'npm.version': info.Binaries?.npm?.version,
    'vscode.version': info.IDEs?.VSCode?.version,
    'cpu.count': cpu.physicalCores,
    'memory.gb': Math.round(mem.total / 1073741824),
    'env.node_env': process.env.NODE_ENV || null,
    'ci.redwood': !!process.env.REDWOOD_CI,
    'ci.isci': _ciInfo.default.isCI,
    'dev.environment': developmentEnvironment,
    complexity,
    sides,
    experiments: (0, _stringify.default)(experiments),
    webBundler,
    uid: UID
  };
}