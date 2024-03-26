"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.apiServerFileHandler = void 0;
require("core-js/modules/es.array.push.js");
var _execa = _interopRequireDefault(require("execa"));
var _projectConfig = require("@redwoodjs/project-config");
const apiServerFileHandler = async argv => {
  const args = ['node', 'server.js', '--apiRootPath', argv.apiRootPath];
  if (argv.port) {
    args.push('--apiPort', argv.port);
  }
  await (0, _execa.default)('yarn', args, {
    cwd: (0, _projectConfig.getPaths)().api.dist,
    stdio: 'inherit'
  });
};
exports.apiServerFileHandler = apiServerFileHandler;