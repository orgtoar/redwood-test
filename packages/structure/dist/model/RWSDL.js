"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWSDL = void 0;

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _path = require("path");

var _parser = require("graphql/language/parser");

var tsm = _interopRequireWildcard(require("ts-morph"));

var _errors = require("../errors");

var _ide = require("../ide");

var _Array = require("../x/Array");

var _decorators = require("../x/decorators");

var _vscodeLanguageserverTypes = require("../x/vscode-languageserver-types");

var _RWSDLField = require("./RWSDLField");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class;

let RWSDL = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.lazy)(), _dec5 = (0, _decorators.lazy)(), _dec6 = (0, _decorators.lazy)(), (_class = class RWSDL extends _ide.FileNode {
  constructor(filePath, parent) {
    super();
    this.filePath = filePath;
    this.parent = parent;
  }
  /**
   * The Template Literal node (string) that contains the schema
   */


  get schemaStringNode() {
    var _this$sf$getVariableD;

    const i = (_this$sf$getVariableD = this.sf.getVariableDeclaration('schema')) === null || _this$sf$getVariableD === void 0 ? void 0 : _this$sf$getVariableD.getInitializer();

    if (!i) {
      return undefined;
    } // TODO: do we allow other kinds of strings? or just tagged literals?


    if (tsm.Node.isTaggedTemplateExpression(i)) {
      const t = i.getTemplate(); //?

      if (tsm.Node.isNoSubstitutionTemplateLiteral(t)) {
        return t;
      }
    }

    return undefined;
  }

  get schemaString() {
    var _this$schemaStringNod;

    return (_this$schemaStringNod = this.schemaStringNode) === null || _this$schemaStringNod === void 0 ? void 0 : _this$schemaStringNod.getLiteralText();
  }

  get serviceFilePath() {
    return this.parent.servicesFilePath(this.name);
  }

  get service() {
    var _context;

    return (0, _find.default)(_context = this.parent.services).call(_context, s => s.name === this.name);
  }

  get name() {
    // TODO: support TS
    const base = (0, _path.basename)(this.filePath);
    return base.substr(0, base.length - '.sdl.js'.length);
  }

  get implementableFields() {
    const self = this;
    return (0, _Array.iter)(function* () {
      if (!self.schemaString) {
        return;
      } //?


      const ast = (0, _parser.parse)(self.schemaString);

      for (const def of ast.definitions) {
        if (def.kind === 'ObjectTypeDefinition') {
          if (def.name.value === 'Query' || def.name.value === 'Mutation') {
            for (const field of (_def$fields = def.fields) !== null && _def$fields !== void 0 ? _def$fields : []) {
              var _def$fields;

              yield new _RWSDLField.RWSDLField(def, field, self);
            }
          }
        }
      }
    });
  }

  children() {
    return [...this.implementableFields];
  }

  *diagnostics() {
    if (!this.schemaStringNode) {
      yield (0, _vscodeLanguageserverTypes.err)(this.uri, "Each SDL file must export a variable named 'schema' with a GraphQL schema string", _errors.RWError.SCHEMA_NOT_DEFINED);
    }
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "schemaStringNode", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "schemaStringNode"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "schemaString", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "schemaString"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "serviceFilePath", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "serviceFilePath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "service", [_dec4], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "service"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "name", [_dec5], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "name"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "implementableFields", [_dec6], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "implementableFields"), _class.prototype)), _class));
exports.RWSDL = RWSDL;