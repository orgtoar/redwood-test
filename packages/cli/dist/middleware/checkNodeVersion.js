"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.checkNodeVersion = checkNodeVersion;
var _semver = _interopRequireDefault(require("semver"));
var _colors = _interopRequireDefault(require("../lib/colors"));
function checkNodeVersion() {
  const checks = {
    ok: true
  };
  const pVersion = process.version;
  const pVersionC = _semver.default.clean(pVersion);
  const LOWER_BOUND = 'v20.0.0';
  const LOWER_BOUND_C = _semver.default.clean(LOWER_BOUND);
  if (_semver.default.gt(pVersionC, LOWER_BOUND_C)) {
    return checks;
  }
  checks.ok = false;
  checks.message = [`Your Node.js version is ${_colors.default.warning(pVersion)}, but Redwood requires ${_colors.default.green(`>=${LOWER_BOUND}`)}.`, 'Upgrade your Node.js version using `nvm` or a similar tool. See https://redwoodjs.com/docs/how-to/using-nvm.'].join('\n');
  return checks;
}