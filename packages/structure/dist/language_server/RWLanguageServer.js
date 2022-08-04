"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWLanguageServer = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _vscodeLanguageserver = require("vscode-languageserver");

var _vscodeLanguageserverTextdocument = require("vscode-languageserver-textdocument");

var _ide = require("../ide");

var _model = require("../model");

var _decorators = require("../x/decorators");

var _URL = require("../x/URL");

var _vscode = require("../x/vscode");

var _vscodeLanguageserver2 = require("../x/vscode-languageserver");

var _vscodeLanguageserverTypes = require("../x/vscode-languageserver-types");

var _commands = require("./commands");

var _diagnostics = require("./diagnostics");

var _outline = require("./outline");

var _xmethods = require("./xmethods");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class;

let RWLanguageServer = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.memo)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.lazy)(), _dec5 = (0, _decorators.lazy)(), _dec6 = (0, _decorators.lazy)(), _dec7 = (0, _decorators.lazy)(), (_class = class RWLanguageServer {
  constructor() {
    this.initializeParams = void 0;
    this.documents = new _vscodeLanguageserver.TextDocuments(_vscodeLanguageserverTextdocument.TextDocument);
    this.projectRoot = void 0;
  }

  get connection() {
    const c = (0, _vscodeLanguageserver.createConnection)(_vscodeLanguageserver.ProposedFeatures.all);
    (0, _vscodeLanguageserver2.Connection_suppressErrors)(c);
    return c;
  }

  start() {
    const {
      connection,
      documents
    } = this;
    connection.onInitialize(params => {
      connection.console.log(`Redwood Language Server onInitialize(), PID=${process.pid}`);
      this.initializeParams = params;
      return {
        capabilities: {
          textDocumentSync: {
            openClose: true,
            change: _vscodeLanguageserver.TextDocumentSyncKind.Full
          },
          implementationProvider: true,
          definitionProvider: true,
          codeActionProvider: true,
          codeLensProvider: {
            resolveProvider: false
          },
          executeCommandProvider: this.commands.options,
          documentLinkProvider: {
            resolveProvider: false
          },
          hoverProvider: true
        }
      };
    });
    connection.onInitialized(async () => {
      connection.console.log('Redwood Language Server onInitialized()');
      const folders = await connection.workspace.getWorkspaceFolders();

      if (folders) {
        for (const folder of folders) {
          this.projectRoot = (0, _URL.URL_toFile)(folder.uri);
        }
      }
    }); // initialize these early on to prevent "unhandled methods"
    // they are smart enough to short-circuit if this.projectRoot is not ready

    this.diagnostics.start();
    this.commands.start();
    this.outline.start();
    this.xmethods.start();
    connection.onImplementation(async ({
      textDocument: {
        uri
      },
      position
    }) => {
      const info = await this.info(uri, 'Implementation');

      for (const i of info) {
        if ((0, _vscodeLanguageserverTypes.Range_contains)(i.location.range, position)) {
          return i.target;
        }
      }
    });
    connection.onDefinition(async ({
      textDocument: {
        uri
      },
      position
    }) => {
      const info = await this.info(uri, 'Definition');

      for (const i of info) {
        if ((0, _vscodeLanguageserverTypes.Range_contains)(i.location.range, position)) {
          return i.target;
        }
      }
    });
    connection.onDocumentLinks(async ({
      textDocument: {
        uri
      }
    }) => {
      var _context;

      return (0, _map.default)(_context = await this.info(uri, 'DocumentLink')).call(_context, i => i.link);
    });
    connection.onCodeAction(async ({
      context,
      textDocument: {
        uri
      }
    }) => {
      var _this$getProject;

      const actions = [];
      const node = await ((_this$getProject = this.getProject()) === null || _this$getProject === void 0 ? void 0 : _this$getProject.findNode(uri));

      if (!node) {
        return [];
      }

      if (context.diagnostics.length > 0) {
        // find quick-fixes associated to diagnostics
        const xds = await node.collectDiagnostics();

        for (const xd of xds) {
          const as = await (0, _vscodeLanguageserverTypes.ExtendedDiagnostic_findRelevantQuickFixes)(xd, context);

          for (const a of as) {
            actions.push(a);
          }
        }
      }

      return actions;
    });
    connection.onCodeLens(async ({
      textDocument: {
        uri
      }
    }) => {
      var _context2;

      return (0, _map.default)(_context2 = await this.info(uri, 'CodeLens')).call(_context2, i => i.codeLens);
    });
    connection.onHover(async ({
      textDocument: {
        uri
      },
      position
    }) => {
      const info = await this.info(uri, 'Hover');

      for (const i of info) {
        if ((0, _vscodeLanguageserverTypes.Range_contains)(i.hover.range, position)) {
          return i.hover;
        }
      }
    });
    documents.listen(connection);
    connection.listen();
  }

  get diagnostics() {
    return new _diagnostics.DiagnosticsManager(this);
  }

  get commands() {
    return new _commands.CommandsManager(this);
  }

  get outline() {
    return new _outline.OutlineManager(this);
  }

  get xmethods() {
    return new _xmethods.XMethodsManager(this);
  }

  get host() {
    return new _ide.HostWithDocumentsStore(this.documents);
  }

  getProject() {
    if (!this.projectRoot) {
      return undefined;
    }

    return new _model.RWProject({
      projectRoot: this.projectRoot,
      host: this.host
    });
  }

  get vscodeWindowMethods() {
    return (0, _vscode.VSCodeWindowMethods_fromConnection)(this.connection);
  }

  async collectIDEInfo(uri) {
    var _await$this$getProjec, _this$getProject2;

    return (_await$this$getProjec = await ((_this$getProject2 = this.getProject()) === null || _this$getProject2 === void 0 ? void 0 : _this$getProject2.collectIDEInfo(uri))) !== null && _await$this$getProjec !== void 0 ? _await$this$getProjec : [];
  }

  async info(uri, kind) {
    var _context3;

    return (0, _filter.default)(_context3 = await this.collectIDEInfo(uri)).call(_context3, i => i.kind === kind);
  }

  get hasWorkspaceFolderCapability() {
    var _this$initializeParam;

    return ((_this$initializeParam = this.initializeParams.capabilities.workspace) === null || _this$initializeParam === void 0 ? void 0 : _this$initializeParam.workspaceFolders) === true;
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "connection", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "connection"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "start", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "start"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "diagnostics", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "diagnostics"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "commands", [_dec4], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "commands"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "outline", [_dec5], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "outline"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "xmethods", [_dec6], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "xmethods"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "host", [_dec7], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "host"), _class.prototype)), _class));
exports.RWLanguageServer = RWLanguageServer;