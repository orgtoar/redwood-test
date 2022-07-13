"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWFunction = void 0;

var _ide = require("../ide");

/**
 * functions exist in the /functions folder
 */
class RWFunction extends _ide.FileNode {
  constructor(filePath, parent) {
    super();
    this.filePath = filePath;
    this.parent = parent;
  }

}

exports.RWFunction = RWFunction;