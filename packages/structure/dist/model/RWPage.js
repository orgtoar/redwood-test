"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RWPage = void 0;

require("core-js/modules/esnext.async-iterator.find.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.find.js");

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.map.delete-all.js");

require("core-js/modules/esnext.map.emplace.js");

require("core-js/modules/esnext.map.every.js");

require("core-js/modules/esnext.map.filter.js");

require("core-js/modules/esnext.map.find.js");

require("core-js/modules/esnext.map.find-key.js");

require("core-js/modules/esnext.map.includes.js");

require("core-js/modules/esnext.map.key-of.js");

require("core-js/modules/esnext.map.map-keys.js");

require("core-js/modules/esnext.map.map-values.js");

require("core-js/modules/esnext.map.merge.js");

require("core-js/modules/esnext.map.reduce.js");

require("core-js/modules/esnext.map.some.js");

require("core-js/modules/esnext.map.update.js");

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