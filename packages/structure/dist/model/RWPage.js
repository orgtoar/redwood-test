"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RWPage = void 0;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var _path = require("path");

var tsm = _interopRequireWildcard(require("ts-morph"));

var _ide = require("../ide");

var _decorators = require("../x/decorators");

var _dec, _dec2, _dec3, _dec4, _class;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

let RWPage = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.lazy)(), (_class = class RWPage extends _ide.FileNode {
  constructor(const_, path, parent) {
    super();
    this.const_ = const_;
    this.path = path;
    this.parent = parent;
  }

  get filePath() {
    return this.path;
  }

  get route() {
    return this.parent.router.routes.find(r => r.page_identifier_str === this.const_);
  }

  get layoutName() {
    const candidates = this.parent.layouts.map(l => l.basenameNoExt);

    if (candidates.length === 0) {
      return undefined;
    }

    for (const tag of this.sf.getDescendantsOfKind(tsm.SyntaxKind.JsxOpeningElement)) {
      const t = tag.getTagNameNode().getText(); //?

      if (candidates.includes(t)) {
        return t;
      }
    }

    return undefined;
  }

  get actionRemove() {
    const edits = new Map(); // delete directory (MyPage/...)

    edits.set((0, _path.dirname)(this.filePath), undefined); // removing a page also removes its route

    if (this.route) {
      edits.set(this.route.jsxNode, undefined);
    } // TODO: we need to transform this edits map to a standard edits map (with locations)


    return edits;
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "filePath", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "filePath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "route", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "route"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "layoutName", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "layoutName"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "actionRemove", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "actionRemove"), _class.prototype)), _class));
exports.RWPage = RWPage;