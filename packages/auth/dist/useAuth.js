"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.useAuth = void 0;

var _react = _interopRequireDefault(require("react"));

var _AuthProvider = require("./AuthProvider");

const useAuth = () => {
  return _react.default.useContext(_AuthProvider.AuthContext);
};

exports.useAuth = useAuth;
global.__REDWOOD__USE_AUTH = useAuth;