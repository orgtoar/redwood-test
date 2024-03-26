"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.webSsrServerHandler = void 0;
var _execa = _interopRequireDefault(require("execa"));
var _projectConfig = require("@redwoodjs/project-config");
const webSsrServerHandler = async () => {
  await (0, _execa.default)('yarn', ['rw-serve-fe'], {
    cwd: (0, _projectConfig.getPaths)().web.base,
    stdio: 'inherit',
    shell: true
  });
};
exports.webSsrServerHandler = webSsrServerHandler;