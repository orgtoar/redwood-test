"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  render: true,
  renderHook: true,
  MockProviders: true
};
Object.defineProperty(exports, "MockProviders", {
  enumerable: true,
  get: function () {
    return _MockProviders.MockProviders;
  }
});
Object.defineProperty(exports, "render", {
  enumerable: true,
  get: function () {
    return _customRender.customRender;
  }
});
Object.defineProperty(exports, "renderHook", {
  enumerable: true,
  get: function () {
    return _customRender.customRenderHook;
  }
});

require("./global");

var _react = require("@testing-library/react");

Object.keys(_react).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _react[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _react[key];
    }
  });
});

var _customRender = require("./customRender");

var _MockProviders = require("./MockProviders");

var _mockRequests = require("./mockRequests");

Object.keys(_mockRequests).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _mockRequests[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _mockRequests[key];
    }
  });
});