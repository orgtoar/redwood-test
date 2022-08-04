"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

class InfallibleErrorBoundary extends _react.default.Component {
  constructor() {
    super(...arguments);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  render() {
    if (this.state.hasError) {
      return /*#__PURE__*/_react.default.createElement("h1", null, "Something went wrong and we are unable to show this page.");
    }

    return this.props.children;
  }

}

class FatalErrorBoundary extends _react.default.Component {
  constructor() {
    super(...arguments);
    this.state = {
      hasError: false,
      error: undefined
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  render() {
    const {
      page: Page
    } = this.props;

    if (this.state.hasError) {
      return /*#__PURE__*/_react.default.createElement(InfallibleErrorBoundary, null, /*#__PURE__*/_react.default.createElement(Page, {
        error: this.state.error
      }));
    }

    return this.props.children;
  }

}

var _default = FatalErrorBoundary;
exports.default = _default;