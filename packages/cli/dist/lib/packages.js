"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.installModule = installModule;
exports.installRedwoodModule = installRedwoodModule;
exports.isModuleInstalled = isModuleInstalled;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _index = require("./index");
// Note: Have to add backslash (\) before @ below for intellisense to display
// the doc comments properly
/**
 * Installs a module into a user's project. If the module is already installed,
 * this function does nothing. If no version is specified, the version will be
 * assumed to be the same as that of \@redwoodjs/cli.
 *
 * @param {string} name The name of the module to install
 * @param {string} version The version of the module to install, otherwise the same as that of \@redwoodjs/cli
 * @param {boolean} isDevDependency Whether to install as a devDependency or not
 * @returns Whether the module was installed or not
 */
async function installModule(name, version = undefined) {
  if (isModuleInstalled(name)) {
    return false;
  }
  if (version === undefined) {
    return installRedwoodModule(name);
  } else {
    await _execa.default.command(`yarn add -D ${name}@${version}`, {
      stdio: 'inherit',
      cwd: (0, _index.getPaths)().base
    });
  }
  return true;
}

/**
 * Installs a Redwood module into a user's project keeping the version
 * consistent with that of \@redwoodjs/cli.
 * If the module is already installed, this function does nothing.
 * If no remote version can not be found which matches the local cli version
 * then the latest canary version will be used.
 *
 * @param {string} module A redwoodjs module, e.g. \@redwoodjs/web
 * @returns {boolean} Whether the module was installed or not
 */
async function installRedwoodModule(module) {
  const packageJsonPath = require.resolve('@redwoodjs/cli/package.json');
  let {
    version
  } = _fsExtra.default.readJSONSync(packageJsonPath);
  if (!isModuleInstalled(module)) {
    var _context;
    // If the version includes a plus, like '4.0.0-rc.428+dd79f1726'
    // (all @canary, @next, and @rc packages do), get rid of everything after the plus.
    if ((0, _includes.default)(version).call(version, '+')) {
      version = version.split('+')[0];
    }
    let packument;
    try {
      const packumentResponse = await fetch(`https://registry.npmjs.org/${module}`);
      packument = await packumentResponse.json();
      if (packument.error) {
        throw new Error(packument.error);
      }
    } catch (error) {
      throw new Error(`Couldn't fetch packument for ${module}: ${error.message}`);
    }
    const versionIsPublished = (0, _includes.default)(_context = (0, _keys.default)(packument.versions)).call(_context, version);
    if (!versionIsPublished) {
      // Fallback to canary. This is most likely because it's a new package
      version = 'canary';
    }

    // We use `version` to make sure we install the same version as the rest
    // of the RW packages
    await _execa.default.command(`yarn add -D ${module}@${version}`, {
      stdio: 'inherit',
      cwd: (0, _index.getPaths)().base
    });
    await _execa.default.command(`yarn dedupe`, {
      stdio: 'inherit',
      cwd: (0, _index.getPaths)().base
    });
    return true;
  }
  return false;
}

/**
 * Check if a user's project's package.json has a module listed as a dependency
 * or devDependency. If not, check node_modules.
 *
 * @param {string} module
 */
function isModuleInstalled(module) {
  var _context2;
  const {
    dependencies,
    devDependencies
  } = _fsExtra.default.readJSONSync(_path.default.join((0, _index.getPaths)().base, 'package.json'));
  const deps = {
    ...dependencies,
    ...devDependencies
  };
  if (deps[module]) {
    return true;
  }

  // Check any of the places require would look for this module.
  // This enables testing with `yarn rwfw project:copy`.
  //
  // We can't use require.resolve here because it caches the exception
  // Making it impossible to require when we actually do install it...
  return (0, _some.default)(_context2 = require.resolve.paths(`${module}/package.json`)).call(_context2, requireResolvePath => {
    return _fsExtra.default.existsSync(_path.default.join(requireResolvePath, module));
  });
}