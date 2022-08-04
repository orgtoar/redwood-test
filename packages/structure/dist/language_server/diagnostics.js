"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.DiagnosticsManager = void 0;

var _setInterval2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/set-interval"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _decorators = require("../x/decorators");

var _vscodeLanguageserverTypes = require("../x/vscode-languageserver-types");

var _dec, _dec2, _class;

const REFRESH_DIAGNOSTICS_INTERVAL = 5000;
const REFRESH_DIAGNOSTICS_DEBOUNCE = 500;
let DiagnosticsManager = (_dec = (0, _decorators.memo)(), _dec2 = (0, _decorators.debounce)(REFRESH_DIAGNOSTICS_DEBOUNCE), (_class = class DiagnosticsManager {
  constructor(server) {
    this.server = server;
    this.previousURIs = [];
  }

  start() {
    (0, _setInterval2.default)(() => this.refreshDiagnostics(), REFRESH_DIAGNOSTICS_INTERVAL); // The content of a text document has changed. This event is emitted
    // when the text document first opened or when its content has changed.

    const {
      documents,
      connection
    } = this.server;
    documents.onDidChangeContent(() => {
      this.refreshDiagnostics();
    });
    connection.onDidChangeWatchedFiles(() => {
      this.refreshDiagnostics();
    });
  } // we need to keep track of URIs so we can "erase" previous diagnostics


  async refreshDiagnostics() {
    const dss = await this.getDiagnosticsGroupedByUri();
    const newURIs = (0, _keys.default)(dss);
    const allURIs = (0, _concat.default)(newURIs).call(newURIs, this.previousURIs);
    this.previousURIs = newURIs;

    for (const uri of allURIs) {
      var _dss$uri;

      const diagnostics = (_dss$uri = dss[uri]) !== null && _dss$uri !== void 0 ? _dss$uri : [];
      this.server.connection.sendDiagnostics({
        uri,
        diagnostics
      });
    }
  }

  async getDiagnosticsGroupedByUri() {
    const project = this.server.getProject();

    if (!project) {
      return {};
    }

    const ds = await project.collectDiagnostics();
    return (0, _vscodeLanguageserverTypes.ExtendedDiagnostic_groupByUri)(ds);
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "start", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "start"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "refreshDiagnostics", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "refreshDiagnostics"), _class.prototype)), _class));
exports.DiagnosticsManager = DiagnosticsManager;