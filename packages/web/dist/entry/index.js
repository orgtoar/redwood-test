"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _redwoodAppRoot = _interopRequireDefault(require("~redwood-app-root"));

var _rootElement$children;

/**
 * When `#redwood-app` isn't empty then it's very likely that you're using
 * prerendering. So React attaches event listeners to the existing markup
 * rather than replacing it.
 * https://reactjs.org/docs/react-dom.html#hydrate
 */
const rootElement = document.getElementById('redwood-app');

if (((_rootElement$children = rootElement.children) === null || _rootElement$children === void 0 ? void 0 : _rootElement$children.length) > 0) {
  _reactDom.default.hydrate( /*#__PURE__*/_react.default.createElement(_redwoodAppRoot.default, null), rootElement);
} else {
  _reactDom.default.render( /*#__PURE__*/_react.default.createElement(_redwoodAppRoot.default, null), rootElement);
}