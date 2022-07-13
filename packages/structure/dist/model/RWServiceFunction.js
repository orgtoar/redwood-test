"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWServiceFunction = void 0;

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _sort = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/sort"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var tsm = _interopRequireWildcard(require("ts-morph"));

var _vscodeLanguageserverTypes = require("vscode-languageserver-types");

var _ide = require("../ide");

var _Array = require("../x/Array");

var _decorators = require("../x/decorators");

var _vscodeLanguageserverTypes2 = require("../x/vscode-languageserver-types");

var _dec, _dec2, _dec3, _class;

let RWServiceFunction = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), (_class = class RWServiceFunction extends _ide.BaseNode {
  constructor(name, node, parent) {
    super();
    this.name = name;
    this.node = node;
    this.parent = parent;
  }

  get id() {
    // This is a compound ID (because it points to an internal node - one within a file)
    return this.parent.id + ' ' + this.name;
  }
  /**
   * The SDL field that this function implements, if any
   * TODO: describe this in prose.
   */


  get sdlField() {
    var _this$parent$sdl, _this$parent$sdl$impl;

    return (_this$parent$sdl = this.parent.sdl) === null || _this$parent$sdl === void 0 ? void 0 : (_this$parent$sdl$impl = _this$parent$sdl.implementableFields) === null || _this$parent$sdl$impl === void 0 ? void 0 : (0, _find.default)(_this$parent$sdl$impl).call(_this$parent$sdl$impl, f => f.name === this.name);
  }

  get parameterNames() {
    const self = this;
    return (0, _Array.iter)(function* () {
      for (const p of self.node.getParameters()) {
        const nn = p.getNameNode();

        if (nn instanceof tsm.ObjectBindingPattern) {
          for (const element of nn.getElements()) {
            yield element.getNameNode().getText();
          }
        } // TODO: handle other cases

      }
    });
  }

  *diagnostics() {
    if (this.sdlField) {
      var _context, _context2;

      // this service function is implementing a field
      // parameter names should match
      const p1 = (0, _sort.default)(_context = this.sdlField.argumentNames).call(_context).join(' '); //?

      const p2 = (0, _sort.default)(_context2 = this.parameterNames).call(_context2).join(' '); //?

      if (p1 !== p2) {
        var _this$node$getParamet;

        const locationNode = (_this$node$getParamet = this.node.getParameters()[0]) !== null && _this$node$getParamet !== void 0 ? _this$node$getParamet : this.node;
        const {
          uri,
          range
        } = (0, _vscodeLanguageserverTypes2.Location_fromNode)(locationNode);
        const message = `Parameter mismatch between SDL and implementation ("${p1}" !== "${p2}")`;
        const diagnostic = {
          uri,
          diagnostic: {
            range,
            message,
            severity: _vscodeLanguageserverTypes.DiagnosticSeverity.Error,
            // add related information so developers can jump to the SDL definition
            relatedInformation: [{
              location: this.sdlField.location,
              message: 'SDL field is defined here'
            }]
          }
        }; // comment out for now (see https://github.com/redwoodjs/redwood/issues/943)

        if (false) yield diagnostic; // eslint-disable-line
      } // TODO: check that types match
      // to do this it is probably easier to leverage a graphql code generator and the typescript compiler
      // the trick is to create a source file with an interface assignment that will fail if there is a mismatch
      // we then simpy "bubble up" the type errors from the typescript compiler

    }
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "id", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "id"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "sdlField", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "sdlField"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "parameterNames", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "parameterNames"), _class.prototype)), _class));
exports.RWServiceFunction = RWServiceFunction;