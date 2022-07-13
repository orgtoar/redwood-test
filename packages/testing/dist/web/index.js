"use strict";

var _context, _context2;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _exportNames = {
  render: true,
  renderHook: true,
  MockProviders: true
};

_Object$defineProperty(exports, "MockProviders", {
  enumerable: true,
  get: function () {
    return _MockProviders.MockProviders;
  }
});

_Object$defineProperty(exports, "render", {
  enumerable: true,
  get: function () {
    return _customRender.customRender;
  }
});

_Object$defineProperty(exports, "renderHook", {
  enumerable: true,
  get: function () {
    return _customRender.customRenderHook;
  }
});

require("./global");

var _react = require("@testing-library/react");

_forEachInstanceProperty(_context = _Object$keys(_react)).call(_context, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _react[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _react[key];
    }
  });
});

var _customRender = require("./customRender");

var _MockProviders = require("./MockProviders");

var _mockRequests = require("./mockRequests");

_forEachInstanceProperty(_context2 = _Object$keys(_mockRequests)).call(_context2, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _mockRequests[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _mockRequests[key];
    }
  });
});