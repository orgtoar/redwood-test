"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.customRenderHook = exports.customRender = void 0;

var _react = _interopRequireDefault(require("react"));

var _react2 = require("@testing-library/react");

var _dom = require("@testing-library/react-hooks/dom");

var _MockProviders = require("./MockProviders");

// `@testing-library/react-hooks` is being deprecated
// since the functionality is moving into v13 of `@testing-library/react`.
// But v13 of `@testing-library/react` drops support for React 17, so we can't upgrade just yet.
// We can remove `@testing-library/react-hooks` after upgrading Redwood to React 18.
const customRender = (ui, options = {}) => {
  return (0, _react2.render)(ui, {
    wrapper: props => /*#__PURE__*/_react.default.createElement(_MockProviders.MockProviders, props),
    ...options
  });
};

exports.customRender = customRender;

const customRenderHook = (render, options) => {
  return (0, _dom.renderHook)(render, {
    wrapper: props => /*#__PURE__*/_react.default.createElement(_MockProviders.MockProviders, props),
    ...options
  });
};

exports.customRenderHook = customRenderHook;