"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsManager = void 0;

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
    setInterval(() => this.refreshDiagnostics(), REFRESH_DIAGNOSTICS_INTERVAL); // The content of a text document has changed. This event is emitted
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
    const newURIs = Object.keys(dss);
    const allURIs = newURIs.concat(this.previousURIs);
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

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "start", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "start"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "refreshDiagnostics", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "refreshDiagnostics"), _class.prototype)), _class));
exports.DiagnosticsManager = DiagnosticsManager;