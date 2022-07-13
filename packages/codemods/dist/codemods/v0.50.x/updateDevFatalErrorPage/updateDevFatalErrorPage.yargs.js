"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = void 0;

var _tasuku = _interopRequireDefault(require("tasuku"));

var _updateDevFatalErrorPage = require("./updateDevFatalErrorPage");

const command = 'update-dev-fatal-error-page';
exports.command = command;
const description = '(v0.49->v0.50) Update Fatal Error Page with development version from the create-redwood-app template';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Update Fatal Error Page with development version', async () => {
    await (0, _updateDevFatalErrorPage.updateDevFatalErrorPage)();
  });
};

exports.handler = handler;