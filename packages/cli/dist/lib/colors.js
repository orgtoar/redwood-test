"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

/**
 * To keep a consistent color/style palette between cli packages, such as
 * @redwood/cli and @redwood/create-redwood-app, please keep them compatible
 * with one and another. We'll might split up and refactor these into a
 * separate package when there is a strong motivation behind it.
 *
 * Current files:
 *
 * - packages/cli/src/lib/colors.js (this file)
 * - packages/create-redwood-app/src/create-redwood-app.js
 */
var _default = {
  error: _chalk.default.bold.red,
  warning: _chalk.default.keyword('orange'),
  green: _chalk.default.green,
  info: _chalk.default.grey,
  bold: _chalk.default.bold,
  underline: _chalk.default.underline
};
exports.default = _default;