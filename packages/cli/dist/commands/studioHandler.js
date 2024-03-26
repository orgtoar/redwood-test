"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.assertRedwoodVersion = assertRedwoodVersion;
exports.handler = void 0;
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _semver = _interopRequireDefault(require("semver"));
var _projectConfig = require("@redwoodjs/project-config");
var _packages = require("../lib/packages");
const handler = async options => {
  try {
    // Check the module is installed
    if (!(0, _packages.isModuleInstalled)('@redwoodjs/studio')) {
      const minVersions = ['7.0.0-canary.889', '7.x', '8.0.0-0'];
      assertRedwoodVersion(minVersions);
      console.log('The studio package is not installed, installing it for you, this may take a moment...');
      await (0, _packages.installModule)('@redwoodjs/studio', '11');
      console.log('Studio package installed successfully.');
      const installedRealtime = await (0, _packages.installModule)('@redwoodjs/realtime');
      if (installedRealtime) {
        console.log("Added @redwoodjs/realtime to your project, as it's used by Studio");
      }
      const installedApiServer = await (0, _packages.installModule)('@redwoodjs/api-server');
      if (installedApiServer) {
        console.log("Added @redwoodjs/api-server to your project, as it's used by Studio");
      }
    }

    // Import studio and start it
    const {
      serve
    } = await import('@redwoodjs/studio');
    await serve({
      open: options.open,
      enableWeb: true
    });
  } catch (e) {
    console.log('Cannot start the development studio');
    console.log(e);
    process.exit(1);
  }
};

// Exported for unit testing
exports.handler = handler;
function assertRedwoodVersion(minVersions) {
  const rwVersion = getProjectRedwoodVersion();
  const coercedRwVersion = _semver.default.coerce(rwVersion);
  if ((0, _some.default)(minVersions).call(minVersions, minVersion => {
    // Have to do this to handle pre-release versions until
    // https://github.com/npm/node-semver/pull/671 is merged
    const v = _semver.default.valid(minVersion) || _semver.default.coerce(minVersion);
    const coercedMin = _semver.default.coerce(minVersion);

    // According to semver 1.0.0-rc.X > 1.0.0-canary.Y (for all values of X
    // and Y)
    // But for Redwood an RC release can be much older than a Canary release
    // (and not contain features from Canary that whoever calls this need)
    // Because RW doesn't 100% follow SemVer for pre-releases we have to
    // have some custom logic here
    return _semver.default.gte(rwVersion, v) && (coercedRwVersion.major === coercedMin.major ? _semver.default.prerelease(rwVersion)?.[0] === _semver.default.prerelease(v)?.[0] : true);
  })) {
    // All good, the user's RW version meets at least one of the minimum
    // version requirements
    return;
  }
  console.error(`The studio command requires Redwood version ${minVersions[0]} or ` + `greater, you are using ${rwVersion}.`);
  process.exit(1);
}
function getProjectRedwoodVersion() {
  const {
    devDependencies
  } = _fsExtra.default.readJSONSync(_nodePath.default.join((0, _projectConfig.getPaths)().base, 'package.json'));
  return devDependencies['@redwoodjs/core'];
}