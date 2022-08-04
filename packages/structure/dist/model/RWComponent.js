"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RWComponent = void 0;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var tsm = _interopRequireWildcard(require("ts-morph"));

var _ide = require("../ide");

var _decorators = require("../x/decorators");

var _dec, _dec2, _dec3, _class;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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