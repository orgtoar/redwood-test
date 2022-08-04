"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RWComponent = void 0;

require("core-js/modules/esnext.set.add-all.js");

require("core-js/modules/esnext.set.delete-all.js");

require("core-js/modules/esnext.set.difference.js");

require("core-js/modules/esnext.set.every.js");

require("core-js/modules/esnext.set.filter.js");

require("core-js/modules/esnext.set.find.js");

require("core-js/modules/esnext.set.intersection.js");

require("core-js/modules/esnext.set.is-disjoint-from.js");

require("core-js/modules/esnext.set.is-subset-of.js");

require("core-js/modules/esnext.set.is-superset-of.js");

require("core-js/modules/esnext.set.join.js");

require("core-js/modules/esnext.set.map.js");

require("core-js/modules/esnext.set.reduce.js");

require("core-js/modules/esnext.set.some.js");

require("core-js/modules/esnext.set.symmetric-difference.js");

require("core-js/modules/esnext.set.union.js");

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var tsm = _interopRequireWildcard(require("ts-morph"));

var _ide = require("../ide");

var _decorators = require("../x/decorators");

var _dec, _dec2, _dec3, _class;

let RWComponent = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), (_class = class RWComponent extends _ide.FileNode {
  constructor(filePath, parent) {
    super();
    this.filePath = filePath;
    this.parent = parent;
  }

  get hasDefaultExport() {
    // TODO: Is this enough to test a default export?
    return this.sf.getDescendantsOfKind(tsm.SyntaxKind.ExportAssignment).length > 0;
  }

  get stories() {
    // TODO: this is a placeholder
    // we could list all the (storybook) stories related to this component here
    return [];
  }

  get exportedSymbols() {
    // KLUDGE!
    const ss = new Set();

    for (const d of this.sf.getDescendantsOfKind(tsm.SyntaxKind.VariableDeclaration)) {
      if (d.isExported()) {
        ss.add(d.getName());
      }
    }

    return ss;
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "hasDefaultExport", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "hasDefaultExport"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "stories", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "stories"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "exportedSymbols", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "exportedSymbols"), _class.prototype)), _class));
exports.RWComponent = RWComponent;