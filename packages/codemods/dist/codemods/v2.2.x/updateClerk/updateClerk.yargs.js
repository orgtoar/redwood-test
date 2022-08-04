"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _path = _interopRequireDefault(require("path"));

var _tasuku = _interopRequireDefault(require("tasuku"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

var _runTransform = _interopRequireDefault(require("../../../lib/runTransform"));

const command = 'update-clerk';
exports.command = command;
const description = '(v2.1.0->v2.2.0) Updates App.{js,tsx} to use the new Clerk auth provider';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Updating App.{js,tsx}', async () => {
    const rwPaths = (0, _getRWPaths.default)();
    await (0, _runTransform.default)({
      transformPath: _path.default.join(__dirname, 'updateClerk.js'),
      targetPaths: [rwPaths.web.app]
    });
  });
};

exports.handler = handler;