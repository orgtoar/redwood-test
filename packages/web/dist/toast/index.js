"use strict";

var _context;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _exportNames = {
  toast: true
};

_Object$defineProperty(exports, "toast", {
  enumerable: true,
  get: function () {
    return _reactHotToast.default;
  }
});

var _reactHotToast = _interopRequireWildcard(require("react-hot-toast"));

_forEachInstanceProperty(_context = _Object$keys(_reactHotToast)).call(_context, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactHotToast[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _reactHotToast[key];
    }
  });
});