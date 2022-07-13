"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _tasuku = _interopRequireDefault(require("tasuku"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

var _isTSProject = _interopRequireDefault(require("../../../lib/isTSProject"));

var _runTransform = _interopRequireDefault(require("../../../lib/runTransform"));

const command = 'update-router-paramTypes';
exports.command = command;
const description = '(v0.38->v0.39) Updates @redwoodjs/router paramTypes';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Updating Routes.{tsx|js}', async ({
    setWarning
  }) => {
    const rwPaths = (0, _getRWPaths.default)();
    const extns = _isTSProject.default ? 'tsx' : 'js';

    const routesFilePath = _path.default.join(rwPaths.web.src, `Routes.${extns}`);

    if (!_fs.default.existsSync(routesFilePath)) {
      setWarning('Routes.{tsx|js} not found');
    } else {
      (0, _runTransform.default)({
        transformPath: _path.default.join(__dirname, 'updateRouterParamTypes.js'),
        targetPaths: [routesFilePath]
      });
    }
  });
};

exports.handler = handler;