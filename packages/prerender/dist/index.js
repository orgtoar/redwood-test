"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _runPrerender = require("./runPrerender");

Object.keys(_runPrerender).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _runPrerender[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _runPrerender[key];
    }
  });
});