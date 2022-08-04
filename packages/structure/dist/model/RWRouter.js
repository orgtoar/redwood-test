"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RWRouter = void 0;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
    var _this$routes$find, _this$routes$find$pag;

    // TODO: params
    return (_this$routes$find = this.routes.find(r => r.path === routePath)) === null || _this$routes$find === void 0 ? void 0 : (_this$routes$find$pag = _this$routes$find.page) === null || _this$routes$find$pag === void 0 ? void 0 : _this$routes$find$pag.filePath;
  } // this is used by the live preview


  getRoutePathForFilePath(filePath) {
    var _this$parent$pages$fi, _this$parent$pages$fi2;

    // TODO: params
    const path = (_this$parent$pages$fi = this.parent.pages.find(p => p.filePath === filePath)) === null || _this$parent$pages$fi === void 0 ? void 0 : (_this$parent$pages$fi2 = _this$parent$pages$fi.route) === null || _this$parent$pages$fi2 === void 0 ? void 0 : _this$parent$pages$fi2.path;

    if (path !== null && path !== void 0 && path.includes('{')) {
      return;
    }

    return path;
  }
  /**
   * the `<Router>` tag
   */


  get jsxNode() {
    return this.sf.getDescendantsOfKind(tsm.SyntaxKind.JsxOpeningElement).find(x => x.getTagNameNode().getText() === 'Router');
  }
  /**
   * One per `<Route>`
   */


  get routes() {
    const self = this;
    return (0, _Array.iter)(function* () {
      if (!self.jsxNode) {
        return;
      } // TODO: make sure that they are nested within the <Router> tag
      // we are not checking it right now


      const sets = self.sf.getDescendantsOfKind(tsm.SyntaxKind.JsxElement).filter(x => {
        const tagName = x.getOpeningElement().getTagNameNode().getText();
        return tagName === 'Set' || tagName === 'Private';
      });
      const prerenderSets = sets.filter(set => set.getOpeningElement().getAttribute('prerender'));

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
    return this.routes.filter(r => r.isNotFound).length;
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
    if (!this.jsxNode) {
      return undefined;
    }

    const change = new _vscodeLanguageserverTypes.WorkspaceChange({
      documentChanges: []
    });
    let uri = (0, _URL.URL_file)(this.parent.defaultNotFoundPageFilePath);
    const p = this.parent.pages.find(p => p.basenameNoExt === 'NotFoundPage');

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
    const indent = ' '.repeat(lastRouteLoc.range.start.character);
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

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "getFilePathForRoutePath", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "getFilePathForRoutePath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "getRoutePathForFilePath", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "getRoutePathForFilePath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "jsxNode", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "jsxNode"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "routes", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "routes"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "numNotFoundPages", [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, "numNotFoundPages"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "quickFix_addNotFoundpage", [_dec6], Object.getOwnPropertyDescriptor(_class.prototype, "quickFix_addNotFoundpage"), _class.prototype)), _class));
exports.RWRouter = RWRouter;