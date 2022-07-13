"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWService = void 0;

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var tsm = _interopRequireWildcard(require("ts-morph"));

var _ide = require("../ide");

var _Array = require("../x/Array");

var _decorators = require("../x/decorators");

var _path = require("../x/path");

var _RWServiceFunction = require("./RWServiceFunction");

var _dec, _dec2, _dec3, _class;

let RWService = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), (_class = class RWService extends _ide.FileNode {
  constructor(filePath, parent) {
    super();
    this.filePath = filePath;
    this.parent = parent;
  }
  /**
   * The name of this service:
   * services/todos/todos.js --> todos
   */


  get name() {
    return (0, _path.basenameNoExt)(this.filePath);
  }
  /**
   * Returns the SDL associated with this service (if any).
   * Match is performed by name.
   */


  get sdl() {
    var _context;

    return (0, _find.default)(_context = this.parent.sdls).call(_context, sdl => sdl.name === this.name);
  }

  children() {
    return [...this.funcs];
  }
  /**
   * All the exported functions declared in this service file.
   * They can be both ArrowFunctions (with name) or FunctionDeclarations (with name)
   */


  get funcs() {
    const self = this;
    return (0, _Array.iter)(function* () {
      // export const foo = () => {}
      for (const vd of self.sf.getVariableDeclarations()) {
        if (vd.isExported()) {
          const init = vd.getInitializerIfKind(tsm.SyntaxKind.ArrowFunction);

          if (init) {
            yield new _RWServiceFunction.RWServiceFunction(vd.getName(), init, self);
          }
        }
      } // export function foo(){}


      for (const fd of self.sf.getFunctions()) {
        if (fd.isExported() && !fd.isDefaultExport()) {
          const nn = fd.getNameNode();

          if (nn) {
            yield new _RWServiceFunction.RWServiceFunction(nn.getText(), fd, self);
          }
        }
      }
    });
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "name", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "name"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "sdl", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "sdl"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "funcs", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "funcs"), _class.prototype)), _class));
exports.RWService = RWService;