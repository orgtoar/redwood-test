"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.realtimeExists = exports.printTaskEpilogue = exports.isServerFileSetup = exports.isRealtimeSetup = exports.getEpilogue = void 0;
var _path = _interopRequireDefault(require("path"));
var _chalk = _interopRequireDefault(require("chalk"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _lib = require("../../lib");
var _project = require("../../lib/project");
const link = (topicId, isTerminal = false) => {
  const communityLink = `https://community.redwoodjs.com/t/${topicId}`;
  if (isTerminal) {
    return (0, _terminalLink.default)(communityLink, communityLink);
  } else {
    return communityLink;
  }
};
const getEpilogue = (command, description, topicId, isTerminal = false) => `This is an experimental feature to: ${description}.\n\nPlease find documentation and links to provide feedback for ${command} at:\n -> ${link(topicId, isTerminal)}`;
exports.getEpilogue = getEpilogue;
const printTaskEpilogue = (command, description, topicId) => {
  console.log(`${_chalk.default.hex('#ff845e')(`------------------------------------------------------------------\n 🧪 ${_chalk.default.green('Experimental Feature')} 🧪\n------------------------------------------------------------------`)}`);
  console.log(getEpilogue(command, description, topicId, false));
  console.log(`${_chalk.default.hex('#ff845e')('------------------------------------------------------------------')}\n`);
};
exports.printTaskEpilogue = printTaskEpilogue;
const isServerFileSetup = () => {
  if (!(0, _project.serverFileExists)()) {
    throw new Error('RedwoodJS Realtime requires a serverful environment. Please run `yarn rw setup server-file` first.');
  }
  return true;
};
exports.isServerFileSetup = isServerFileSetup;
const realtimeExists = () => {
  const realtimePath = _path.default.join((0, _lib.getPaths)().api.lib, `realtime.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
  return _fsExtra.default.existsSync(realtimePath);
};
exports.realtimeExists = realtimeExists;
const isRealtimeSetup = () => {
  if (!realtimeExists) {
    throw new Error('Adding realtime events requires that RedwoodJS Realtime be setup. Please run `yarn setup realtime` first.');
  }
  return true;
};
exports.isRealtimeSetup = isRealtimeSetup;