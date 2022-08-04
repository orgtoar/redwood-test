"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

/**
 * this initial implementation borrows (heavily!) from madalyn's great work at gatsby:
 * - issue: https://github.com/gatsbyjs/gatsby/issues/21059
 * - PR: https://github.com/gatsbyjs/gatsby/pull/26376
 */
const RouteFocus = _ref => {
  let {
    children,
    ...props
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, props, {
    "data-redwood-route-focus": true
  }), children);
};

var _default = RouteFocus;
exports.default = _default;