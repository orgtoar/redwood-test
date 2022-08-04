"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWComponent = void 0;

var _set = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/set"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

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
    const ss = new _set.default();

    for (const d of this.sf.getDescendantsOfKind(tsm.SyntaxKind.VariableDeclaration)) {
      if (d.isExported()) {
        ss.add(d.getName());
      }
    }

    return ss;
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "hasDefaultExport", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "hasDefaultExport"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "stories", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "stories"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "exportedSymbols", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "exportedSymbols"), _class.prototype)), _class));
exports.RWComponent = RWComponent;