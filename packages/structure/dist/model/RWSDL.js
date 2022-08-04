"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RWSDL = void 0;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
    return this.parent.services.find(s => s.name === this.name);
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

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "schemaStringNode", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "schemaStringNode"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "schemaString", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "schemaString"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "serviceFilePath", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "serviceFilePath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "service", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "service"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "name", [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, "name"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "implementableFields", [_dec6], Object.getOwnPropertyDescriptor(_class.prototype, "implementableFields"), _class.prototype)), _class));
exports.RWSDL = RWSDL;