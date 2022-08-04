"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWPage = void 0;

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _map2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/map"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _path = require("path");

var tsm = _interopRequireWildcard(require("ts-morph"));

var _ide = require("../ide");

var _decorators = require("../x/decorators");

var _dec, _dec2, _dec3, _dec4, _class;

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
    var _context;

    return (0, _find.default)(_context = this.parent.router.routes).call(_context, r => r.page_identifier_str === this.const_);
  }

  get layoutName() {
    var _context2;

    const candidates = (0, _map.default)(_context2 = this.parent.layouts).call(_context2, l => l.basenameNoExt);

    if (candidates.length === 0) {
      return undefined;
    }

    for (const tag of this.sf.getDescendantsOfKind(tsm.SyntaxKind.JsxOpeningElement)) {
      const t = tag.getTagNameNode().getText(); //?

      if ((0, _includes.default)(candidates).call(candidates, t)) {
        return t;
      }
    }

    return undefined;
  }

  get actionRemove() {
    const edits = new _map2.default(); // delete directory (MyPage/...)

    edits.set((0, _path.dirname)(this.filePath), undefined); // removing a page also removes its route

    if (this.route) {
      edits.set(this.route.jsxNode, undefined);
    } // TODO: we need to transform this edits map to a standard edits map (with locations)


    return edits;
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "filePath", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "filePath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "route", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "route"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "layoutName", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "layoutName"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "actionRemove", [_dec4], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "actionRemove"), _class.prototype)), _class));
exports.RWPage = RWPage;