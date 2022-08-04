"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWTOML = void 0;

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _toml = require("toml");

var _vscodeLanguageserverTypes = require("vscode-languageserver-types");

var _ide = require("../ide");

var _decorators = require("../x/decorators");

var _vscodeLanguageserverTypes2 = require("../x/vscode-languageserver-types");

var _dec, _dec2, _class;

let RWTOML = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), (_class = class RWTOML extends _ide.FileNode {
  constructor(filePath, parent) {
    super();
    this.filePath = filePath;
    this.parent = parent;
  } // @lazy() get content(): TOML.JsonMap {
  //   return TOML.parse(this.text)
  // }
  // TODO: diagnostics


  get parsedTOML() {
    return (0, _toml.parse)(this.text);
  }

  get web_includeEnvironmentVariables() {
    var _this$parsedTOML$web$, _this$parsedTOML, _this$parsedTOML$web;

    return (_this$parsedTOML$web$ = (_this$parsedTOML = this.parsedTOML) === null || _this$parsedTOML === void 0 ? void 0 : (_this$parsedTOML$web = _this$parsedTOML.web) === null || _this$parsedTOML$web === void 0 ? void 0 : _this$parsedTOML$web.includeEnvironmentVariables) !== null && _this$parsedTOML$web$ !== void 0 ? _this$parsedTOML$web$ : [];
  }

  *diagnostics() {
    try {
      this.parsedTOML;
    } catch (e) {
      const pos = {
        line: e.line - 1,
        character: e.column - 1
      };

      const range = _vscodeLanguageserverTypes.Range.create(pos, pos); // Forward the TOML parse error with correct location information


      yield (0, _vscodeLanguageserverTypes2.err)({
        uri: this.uri,
        range
      }, 'TOML Parser Error: ' + e.message);
      return;
    } // at this point we know that the TOML was parsed successfully
    //this.parsedTOML //?
    //const allowedTopElements = ['web', 'api']
    // TODO: check that schema is correct

  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "parsedTOML", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "parsedTOML"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "web_includeEnvironmentVariables", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "web_includeEnvironmentVariables"), _class.prototype)), _class));
exports.RWTOML = RWTOML;