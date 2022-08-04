"use strict";

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _telemetry = require("./telemetry");

Object.keys(_telemetry).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _telemetry[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _telemetry[key];
    }
  });
});