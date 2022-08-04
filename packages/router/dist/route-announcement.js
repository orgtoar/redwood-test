"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

/**
 * this initial implementation borrows (heavily!) from madalyn's great work at gatsby:
 * - issue: https://github.com/gatsbyjs/gatsby/issues/21059
 * - PR: https://github.com/gatsbyjs/gatsby/pull/26376
 */
const RouteAnnouncement = _ref => {
  let {
    children,
    visuallyHidden = false,
    ...props
  } = _ref;
  const hiddenStyle = {
    position: "absolute",
    top: "0",
    width: "1",
    height: "1",
    padding: "0",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0"
  };
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, props, {
    "data-redwood-route-announcement": true,
    style: visuallyHidden ? hiddenStyle : {}
  }), children);
};

var _default = RouteAnnouncement;
exports.default = _default;