"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MockParamsProvider = void 0;

var _react = _interopRequireDefault(require("react"));

var _router = require("@redwoodjs/router");

const MockParamsProvider = ({
  children
}) => {
  const location = (0, _router.useLocation)();
  const searchParams = (0, _router.parseSearch)(location.search);
  return /*#__PURE__*/_react.default.createElement(_router.ParamsContext.Provider, {
    value: {
      params: { ...searchParams
      }
    }
  }, children);
};

exports.MockParamsProvider = MockParamsProvider;