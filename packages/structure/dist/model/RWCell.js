"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RWCell = void 0;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _graphql = require("graphql");

var tsm = _interopRequireWildcard(require("ts-morph"));

var _vscodeLanguageserverTypes = require("vscode-languageserver-types");

var _decorators = require("../x/decorators");

var _vscodeLanguageserverTypes2 = require("../x/vscode-languageserver-types");

var _RWComponent = require("./RWComponent");

var _dec, _dec2, _dec3, _dec4, _dec5, _class;

let RWCell = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.lazy)(), _dec5 = (0, _decorators.lazy)(), (_class = class RWCell extends _RWComponent.RWComponent {
  /**
   * A "Cell" is a component that ends in `Cell.{js, jsx, tsx}`, has no
   * default export AND exports `QUERY`
   **/
  get isCell() {
    return !this.hasDefaultExport && this.exportedSymbols.has('QUERY');
  } // TODO: Move to RWCellQuery


  get queryStringNode() {
    var _this$sf$getVariableD;

    const i = (_this$sf$getVariableD = this.sf.getVariableDeclaration('QUERY')) === null || _this$sf$getVariableD === void 0 ? void 0 : _this$sf$getVariableD.getInitializer();

    if (!i) {
      return undefined;
    } // TODO: do we allow other kinds of strings? or just tagged literals?


    if (tsm.Node.isTaggedTemplateExpression(i)) {
      const t = i.getTemplate();

      if (tsm.Node.isNoSubstitutionTemplateLiteral(t)) {
        return t;
      }
    }

    return undefined;
  } // TODO: Move to RWCellQuery


  get queryString() {
    var _this$queryStringNode;

    return (_this$queryStringNode = this.queryStringNode) === null || _this$queryStringNode === void 0 ? void 0 : _this$queryStringNode.getLiteralText();
  } // TODO: Move to RWCellQuery


  get queryAst() {
    const qs = this.queryString;

    if (!qs) {
      return undefined;
    }

    try {
      return (0, _graphql.parse)(qs);
    } catch (e) {
      console.error("Can't parse the graphql query string in", this.filePath);
      console.error(e);
      return undefined;
    }
  } // TODO: Move to RWCellQuery


  get queryOperationName() {
    const ast = this.queryAst;

    if (!ast) {
      return undefined;
    }

    for (const def of ast.definitions) {
      if (def.kind == 'OperationDefinition') {
        var _def$name;

        return def === null || def === void 0 ? void 0 : (_def$name = def.name) === null || _def$name === void 0 ? void 0 : _def$name.value;
      }
    }

    return undefined;
  }

  *diagnostics() {
    // check that QUERY and Success are exported
    if (!this.exportedSymbols.has('QUERY')) {
      yield (0, _vscodeLanguageserverTypes2.err)(this.uri, 'Every Cell MUST export a QUERY variable (GraphQL query string)');
    }

    try {
      if (!this.queryOperationName) {
        yield {
          uri: this.uri,
          diagnostic: {
            range: (0, _vscodeLanguageserverTypes2.Range_fromNode)(this.queryStringNode),
            message: 'We recommend that you name your query operation',
            severity: _vscodeLanguageserverTypes.DiagnosticSeverity.Warning
          }
        };
      }
    } catch (e) {
      // Maybe the AST has a syntax error...
      yield {
        uri: this.uri,
        diagnostic: {
          // TODO: Try to figure out if we can point directly to the syntax error.
          range: (0, _vscodeLanguageserverTypes2.Range_fromNode)(this.sf.getVariableDeclaration('QUERY')),
          message: e.message,
          severity: _vscodeLanguageserverTypes.DiagnosticSeverity.Error
        }
      };
    } // TODO: check that exported QUERY is semantically valid GraphQL (fields exist)


    if (!this.exportedSymbols.has('Success')) {
      yield (0, _vscodeLanguageserverTypes2.err)(this.uri, 'Every Cell MUST export a Success variable (React Component)');
    }
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "isCell", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "isCell"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "queryStringNode", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "queryStringNode"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "queryString", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "queryString"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "queryAst", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "queryAst"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "queryOperationName", [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, "queryOperationName"), _class.prototype)), _class));
exports.RWCell = RWCell;