"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RWLayout = void 0;

var _ide = require("../ide");

/**
 * layouts live in the src/layouts folder
 */
class RWLayout extends _ide.FileNode {
  constructor(filePath, parent) {
    super();
    this.filePath = filePath;
    this.parent = parent;
  }

}

exports.RWLayout = RWLayout;