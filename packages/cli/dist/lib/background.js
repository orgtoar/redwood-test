"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.spawnBackgroundProcess = spawnBackgroundProcess;
var _child_process = require("child_process");
var _os = _interopRequireDefault(require("os"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _projectConfig = require("@redwoodjs/project-config");
/**
 * Spawn a background process with the stdout/stderr redirected to log files within the `.redwood` directory.
 * Stdin will not be available to the process as it will be set to the 'ignore' value.
 *
 * @param {string} name A name for this background process, will be used to name the log files
 * @param {string} cmd Command to pass to the `spawn` function
 * @param {string[]} args Arguements to pass to the `spawn` function
 */
function spawnBackgroundProcess(name, cmd, args) {
  const logDirectory = _path.default.join((0, _projectConfig.getPaths)().generated.base, 'logs');
  _fsExtra.default.ensureDirSync(logDirectory);
  const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const logHeader = [`Starting log:`, ` - Time: ${new Date().toISOString()}`, ` - Name: ${name} (${safeName})`, ` - Command: ${cmd}`, ` - Arguments: ${args.join(' ')}`, '', ''].join('\n');
  const stdout = _fsExtra.default.openSync(_path.default.join(logDirectory, `${safeName}.out.log`), 'w');
  _fsExtra.default.writeSync(stdout, logHeader);
  const stderr = _fsExtra.default.openSync(_path.default.join(logDirectory, `${safeName}.err.log`), 'w');
  _fsExtra.default.writeSync(stderr, logHeader);

  // We must account for some platform specific behaviour
  const spawnOptions = _os.default.type() === 'Windows_NT' ? {
    // The following options run the process in the background without a console window, even though they don't look like they would.
    // See https://github.com/nodejs/node/issues/21825#issuecomment-503766781 for information
    detached: false,
    windowsHide: false,
    shell: true,
    stdio: ['ignore', stdout, stderr]
  } : {
    detached: true,
    stdio: ['ignore', stdout, stderr]
  };

  // Spawn and detach the process
  const child = (0, _child_process.spawn)(cmd, args, spawnOptions);
  child.unref();
}