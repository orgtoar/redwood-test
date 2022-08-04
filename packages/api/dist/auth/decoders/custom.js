"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.custom = void 0;

/**
 * The Custom decoder will never return a decoded token or value.
 * Instead, it is the developer's responsibility to use other values passed to
 * getCurrentUser such as token or header parameters to authenticate
 *
 * @returns null
 */
const custom = () => {
  return null;
};

exports.custom = custom;