"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  toast: true
};
Object.defineProperty(exports, "toast", {
  enumerable: true,
  get: function () {
    return _reactHotToast.default;
  }
});

var _reactHotToast = _interopRequireWildcard(require("react-hot-toast"));

Object.keys(_reactHotToast).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactHotToast[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _reactHotToast[key];
    }
  });
});