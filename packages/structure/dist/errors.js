"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWError = void 0;

/**
 * Stable error codes
 * TODO: use numbers? they tend to be more resilient to changes.
 */
let RWError;
exports.RWError = RWError;

(function (RWError) {
  RWError["SERVICE_NOT_IMPLEMENTED"] = "SERVICE_NOT_IMPLEMENTED";
  RWError["NOTFOUND_PAGE_NOT_DEFINED"] = "NOTFOUND_PAGE_NOT_DEFINED";
  RWError["INVALID_ROUTE_PATH_SYNTAX"] = "INVALID_ROUTE_PATH_SYNTAX";
  RWError["SCHEMA_NOT_DEFINED"] = "SCHEMA_NOT_DEFINED";
})(RWError || (exports.RWError = RWError = {}));