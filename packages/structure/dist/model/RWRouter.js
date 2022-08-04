"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWRouter = void 0;

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _repeat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/repeat"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var tsm = _interopRequireWildcard(require("ts-morph"));

var _vscodeLanguageserverTypes = require("vscode-languageserver-types");

var _errors = require("../errors");

var _ide = require("../ide");

var _Array = require("../x/Array");

var _decorators = require("../x/decorators");

var _URL = require("../x/URL");

var _vscodeLanguageserverTypes2 = require("../x/vscode-languageserver-types");

var _RWRoute = require("./RWRoute");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class;

/**
 * one per Routes.js
 */
let RWRouter = (_dec = (0, _decorators.memo)(), _dec2 = (0, _decorators.memo)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.lazy)(), _dec5 = (0, _decorators.lazy)(), _dec6 = (0, _decorators.lazy)(), (_class = class RWRouter extends _ide.FileNode {
  constructor(filePath, parent) {
    super();
    this.filePath = filePath;
    this.parent = parent;
  } // this is used by the live preview


  getFilePathForRoutePath(routePath) {
    var _this$routes$find, _this$routes$find$pag, _context;

    // TODO: params
    return (_this$routes$find = (0, _find.default)(_context = this.routes).call(_context, r => r.path === routePath)) === null || _this$routes$find === void 0 ? void 0 : (_this$routes$find$pag = _this$routes$find.page) === null || _this$routes$find$pag === void 0 ? void 0 : _this$routes$find$pag.filePath;
  } // this is used by the live preview


  getRoutePathForFilePath(filePath) {
    var _this$parent$pages$fi, _this$parent$pages$fi2, _context2;

    // TODO: params
    const path = (_this$parent$pages$fi = (0, _find.default)(_context2 = this.parent.pages).call(_context2, p => p.filePath === filePath)) === null || _this$parent$pages$fi === void 0 ? void 0 : (_this$parent$pages$fi2 = _this$parent$pages$fi.route) === null || _this$parent$pages$fi2 === void 0 ? void 0 : _this$parent$pages$fi2.path;

    if (path !== null && path !== void 0 && (0, _includes.default)(path).call(path, '{')) {
      return;
    }

    return path;
  }
  /**
   * the `<Router>` tag
   */


  get jsxNode() {
    var _context3;

    return (0, _find.default)(_context3 = this.sf.getDescendantsOfKind(tsm.SyntaxKind.JsxOpeningElement)).call(_context3, x => x.getTagNameNode().getText() === 'Router');
  }
  /**
   * One per `<Route>`
   */


  get routes() {
    const self = this;
    return (0, _Array.iter)(function* () {
      var _context4;

      if (!self.jsxNode) {
        return;
      } // TODO: make sure that they are nested within the <Router> tag
      // we are not checking it right now


      const sets = (0, _filter.default)(_context4 = self.sf.getDescendantsOfKind(tsm.SyntaxKind.JsxElement)).call(_context4, x => {
        const tagName = x.getOpeningElement().getTagNameNode().getText();
        return tagName === 'Set' || tagName === 'Private';
      });
      const prerenderSets = (0, _filter.default)(sets).call(sets, set => set.getOpeningElement().getAttribute('prerender'));

      for (const set of prerenderSets) {
        for (const x of set.getDescendantsOfKind(tsm.SyntaxKind.JsxSelfClosingElement)) {
          const tagName = x.getTagNameNode().getText();

          if (tagName === 'Route') {
            x.insertAttribute(0, {
              name: 'prerender'
            });
          }
        }
      }

      for (const x of self.sf.getDescendantsOfKind(tsm.SyntaxKind.JsxSelfClosingElement)) {
        const tagName = x.getTagNameNode().getText();

        if (tagName === 'Route') {
          yield new _RWRoute.RWRoute(x, self);
        }
      }
    });
  }

  get numNotFoundPages() {
    var _context5;

    return (0, _filter.default)(_context5 = this.routes).call(_context5, r => r.isNotFound).length;
  }

  *ideInfo() {
    if (this.jsxNode) {
      let location = (0, _vscodeLanguageserverTypes2.Location_fromNode)(this.jsxNode);
      const codeLens = {
        range: location.range,
        command: _vscodeLanguageserverTypes.Command.create('Create Page...', 'redwoodjs.cli', 'generate page...', this.parent.projectRoot)
      };
      yield {
        kind: 'CodeLens',
        location,
        codeLens
      };
    }
  }

  get quickFix_addNotFoundpage() {
    var _context6, _context7;

    if (!this.jsxNode) {
      return undefined;
    }

    const change = new _vscodeLanguageserverTypes.WorkspaceChange({
      documentChanges: []
    });
    let uri = (0, _URL.URL_file)(this.parent.defaultNotFoundPageFilePath);
    const p = (0, _find.default)(_context6 = this.parent.pages).call(_context6, p => p.basenameNoExt === 'NotFoundPage');

    if (p) {
      uri = p.uri; // page already exists, we just need to add the <Route/>
    } else {
      change.createFile(uri);
      change.getTextEditChange({
        uri,
        version: null
      }).insert(_vscodeLanguageserverTypes.Position.create(0, 0), `export default () => <div>Not Found</div>`);
    } // add <Route/>


    const loc = (0, _vscodeLanguageserverTypes2.LocationLike_toLocation)(this.jsxNode);
    const lastRoute = this.routes[this.routes.length - 1];
    const lastRouteLoc = (0, _vscodeLanguageserverTypes2.LocationLike_toLocation)(lastRoute.jsxNode);
    const textEditChange = change.getTextEditChange({
      uri: loc.uri,
      version: null
    });
    const indent = (0, _repeat.default)(_context7 = ' ').call(_context7, lastRouteLoc.range.start.character);
    textEditChange.insert(lastRouteLoc.range.end, `\n${indent}<Route notfound page={NotFoundPage}/>\n`);
    return {
      title: 'Create default Not Found Page',
      edit: change.edit
    };
  }

  *diagnostics() {
    if (!this.fileExists) {
      // should we assign this error to the project? to redwood.toml?
      const uri = (0, _URL.URL_file)(this.parent.projectRoot, 'redwood.toml');
      const message = `Routes.js does not exist`;
      yield (0, _vscodeLanguageserverTypes2.err)(uri, message); // TODO: add quickFix (create a simple Routes.js)

      return; // stop checking for errors if the file doesn't exist
    }

    if (!this.jsxNode) {
      return;
    }

    if (this.numNotFoundPages === 0) {
      const {
        uri,
        range
      } = (0, _vscodeLanguageserverTypes2.LocationLike_toLocation)(this.jsxNode);
      yield {
        uri,
        diagnostic: {
          range,
          message: "You must specify a 'notfound' page",
          severity: _vscodeLanguageserverTypes.DiagnosticSeverity.Error
        },
        quickFix: async () => this.quickFix_addNotFoundpage
      };
    } else if (this.numNotFoundPages > 1) {
      const e = (0, _vscodeLanguageserverTypes2.err)(this.jsxNode, "You must specify exactly one 'notfound' page", _errors.RWError.NOTFOUND_PAGE_NOT_DEFINED);
      yield e;
    }
  }

  children() {
    return [...this.routes];
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "getFilePathForRoutePath", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "getFilePathForRoutePath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "getRoutePathForFilePath", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "getRoutePathForFilePath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "jsxNode", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "jsxNode"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "routes", [_dec4], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "routes"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "numNotFoundPages", [_dec5], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "numNotFoundPages"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "quickFix_addNotFoundpage", [_dec6], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "quickFix_addNotFoundpage"), _class.prototype)), _class));
exports.RWRouter = RWRouter;