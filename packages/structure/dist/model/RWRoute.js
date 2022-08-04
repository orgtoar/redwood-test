"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RWRoute = void 0;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _path = require("path");

var tsm = _interopRequireWildcard(require("ts-morph"));

var _vscodeLanguageserverTypes = require("vscode-languageserver-types");

var _errors = require("../errors");

var _ide = require("../ide");

var _util = require("../util");

var _decorators = require("../x/decorators");

var _vscodeLanguageserverTypes2 = require("../x/vscode-languageserver-types");

var _advanced_path_parser = require("./util/advanced_path_parser");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class;

let RWRoute = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.lazy)(), _dec5 = (0, _decorators.lazy)(), _dec6 = (0, _decorators.lazy)(), _dec7 = (0, _decorators.lazy)(), _dec8 = (0, _decorators.lazy)(), _dec9 = (0, _decorators.lazy)(), _dec10 = (0, _decorators.lazy)(), _dec11 = (0, _decorators.lazy)(), _dec12 = (0, _decorators.lazy)(), _dec13 = (0, _decorators.lazy)(), _dec14 = (0, _decorators.lazy)(), _dec15 = (0, _decorators.lazy)(), _dec16 = (0, _decorators.lazy)(), _dec17 = (0, _decorators.lazy)(), _dec18 = (0, _decorators.lazy)(), _dec19 = (0, _decorators.lazy)(), _dec20 = (0, _decorators.lazy)(), _dec21 = (0, _decorators.lazy)(), (_class = class RWRoute extends _ide.BaseNode {
  constructor(
  /**
   * the <Route> tag
   */
  jsxNode, parent) {
    super();
    this.jsxNode = jsxNode;
    this.parent = parent;
  }

  get id() {
    // we cannot rely on the "path" attribute of the node
    // it might not be unique (which is an error state, but valid while editing)
    return this.parent.id + ' ' + this.jsxNode.getStart();
  }

  get location() {
    return (0, _vscodeLanguageserverTypes2.LocationLike_toLocation)(this.jsxNode);
  }

  get isPrivate() {
    var _this$jsxNode$getPare, _this$jsxNode$getPare2, _this$jsxNode$getPare3;

    const tagText = (_this$jsxNode$getPare = this.jsxNode.getParentIfKind(tsm.SyntaxKind.JsxElement)) === null || _this$jsxNode$getPare === void 0 ? void 0 : (_this$jsxNode$getPare2 = _this$jsxNode$getPare.getOpeningElement()) === null || _this$jsxNode$getPare2 === void 0 ? void 0 : (_this$jsxNode$getPare3 = _this$jsxNode$getPare2.getTagNameNode()) === null || _this$jsxNode$getPare3 === void 0 ? void 0 : _this$jsxNode$getPare3.getText();
    return tagText === 'Private';
  }

  get hasParameters() {
    var _context;

    if (!this.path) {
      return false;
    } // KLUDGE: we need a good path parsing library here


    return (0, _includes.default)(_context = this.path).call(_context, '{');
  }

  get hasPrerender() {
    return this.prerender;
  }

  get hasPreRenderInfo() {
    // TODO: this is just a placeholder / reminder
    return false;
  }

  get outlineLabel() {
    var _this$path;

    if (this.isNotFound) {
      return '404';
    }

    return (_this$path = this.path) !== null && _this$path !== void 0 ? _this$path : '';
  }

  get outlineDescription() {
    var _this$page;

    const fp = (_this$page = this.page) === null || _this$page === void 0 ? void 0 : _this$page.filePath;

    if (!fp) {
      return undefined;
    }

    return (0, _path.basename)(fp);
  }

  get outlineLink() {
    return (0, _vscodeLanguageserverTypes2.LocationLike_toHashLink)(this.location); //return LocationLike_toTerminalLink(this.location)
  }
  /**
   * The associated Redwood Page node, if any
   */


  get page() {
    var _context2;

    if (!this.page_identifier_str) {
      return undefined;
    }

    return (0, _find.default)(_context2 = this.parent.parent.pages).call(_context2, p => p.const_ === this.page_identifier_str);
  }
  /**
   * <Route path="" page={THIS_IDENTIFIER}/>
   */


  get page_identifier() {
    const a = this.jsxNode.getAttribute('page');

    if (!a) {
      return undefined;
    }

    if (tsm.Node.isJsxAttribute(a)) {
      const init = a.getInitializer();

      if (tsm.Node.isJsxExpression(init)) {
        const expr = init.getExpression();

        if (tsm.Node.isIdentifier(expr)) {
          return expr;
        }
      }
    }

    return undefined;
  }

  get page_identifier_str() {
    var _this$page_identifier;

    return (_this$page_identifier = this.page_identifier) === null || _this$page_identifier === void 0 ? void 0 : _this$page_identifier.getText();
  }

  get name() {
    return this.getStringAttr('name');
  }

  get path_errorMessage() {
    // TODO: path validation is not strong enough
    if (typeof this.path === 'undefined') {
      return undefined;
    }

    try {
      (0, _util.validateRoutePath)(this.path);
      return undefined;
    } catch (e) {
      return e.toString();
    }
  }

  get path() {
    return this.getStringAttr('path');
  }

  get prerender() {
    return this.getBoolAttr('prerender');
  }

  get path_literal_node() {
    const a = this.jsxNode.getAttribute('path');

    if (!a) {
      return undefined;
    }

    if (tsm.Node.isJsxAttribute(a)) {
      const init = a.getInitializer();

      if (tsm.Node.isStringLiteral(init)) {
        return init;
      }
    }

    return undefined;
  }

  get isNotFound() {
    return typeof this.jsxNode.getAttribute('notfound') !== 'undefined';
  }

  *diagnostics() {
    if (this.page_identifier && !this.page) {
      // normally this would be caught by TypeScript
      // but Redwood has some "magic" import behavior going on
      yield (0, _vscodeLanguageserverTypes2.err)(this.page_identifier, 'Page component not found');
    }

    if (this.path_errorMessage && this.path_literal_node) {
      yield (0, _vscodeLanguageserverTypes2.err)(this.path_literal_node, this.path_errorMessage, _errors.RWError.INVALID_ROUTE_PATH_SYNTAX);
    }

    if (this.hasPathCollision) {
      yield (0, _vscodeLanguageserverTypes2.err)(this.path_literal_node, 'Duplicate Path');
    }

    if (this.isPrivate && this.isNotFound) {
      yield (0, _vscodeLanguageserverTypes2.err)(this.jsxNode, "The 'Not Found' page cannot be within a <Private> tag");
    }

    if (this.isNotFound && this.path) {
      yield (0, _vscodeLanguageserverTypes2.err)(this.path_literal_node, "The 'Not Found' page cannot have a path");
    }

    if (this.hasPreRenderInfo && !this.hasParameters) {
      yield (0, _vscodeLanguageserverTypes2.err)(this.jsxNode, `Only routes with parameters can have associated prerender information`);
    }
  }

  *ideInfo() {
    // definition: page identifier --> page
    if (this.page && this.page_identifier) {
      yield {
        kind: 'Definition',
        location: (0, _vscodeLanguageserverTypes2.Location_fromNode)(this.page_identifier),
        target: (0, _vscodeLanguageserverTypes2.Location_fromFilePath)(this.page.filePath)
      };
    }

    if (this.path && this.page) {// const location = Location_fromNode(this.jsxNode!)
      // yield { kind: 'Hover', location, text: 'Open Preview' }
    }

    yield* this.decorations();
    const {
      sampleLocalPreviewURL
    } = this;

    if (sampleLocalPreviewURL) {
      const range = (0, _vscodeLanguageserverTypes2.Range_fromNode)(this.jsxNode);
      yield {
        kind: 'Hover',
        location: {
          uri: this.parent.uri,
          range
        },
        hover: {
          range,
          contents: `[Open Preview](${sampleLocalPreviewURL})`
        }
      };
      const {
        path_literal_node
      } = this;

      if (path_literal_node) {
        const range = (0, _vscodeLanguageserverTypes2.Range_fromNode)(this.path_literal_node);
        yield {
          kind: 'DocumentLink',
          location: {
            uri: this.parent.uri,
            range
          },
          link: {
            range,
            target: sampleLocalPreviewURL,
            tooltip: sampleLocalPreviewURL
          }
        };
      }
    }
  }

  get hasPathCollision() {
    if (!this.path) {
      return false;
    }

    const pathWithNoParamNames = removeParamNames(this.path);

    for (const route2 of this.parent.routes) {
      if (route2 === this) {
        continue;
      }

      if (!route2.path) {
        continue;
      }

      if (removeParamNames(route2.path) === pathWithNoParamNames) {
        return true;
      }
    }

    return false;

    function removeParamNames(p) {
      // TODO: implement
      // foo/{bar}/baz --> foo/{}/baz
      return p;
    }
  }

  getBoolAttr(name) {
    const a = this.jsxNode.getAttribute(name); // No attribute

    if (!a) {
      return false;
    } // Attribute exists


    if (tsm.Node.isJsxAttribute(a)) {
      const init = a.getInitializer(); // If it contains prerender="true"

      if (tsm.Node.isStringLiteral(init)) {
        const literalValue = init.getLiteralValue();
        return literalValue === 'true';
      } else {
        // If it contains just prerender
        return true;
      }
    }

    return false;
  }

  getStringAttr(name) {
    const a = this.jsxNode.getAttribute(name);

    if (!a) {
      return undefined;
    }

    if (tsm.Node.isJsxAttribute(a)) {
      const init = a.getInitializer();

      if (tsm.Node.isStringLiteral(init)) {
        return init.getLiteralValue();
      }
    }

    return undefined;
  }

  get parsedPath() {
    if (!this.path) {
      return undefined;
    }

    return (0, _advanced_path_parser.advanced_path_parser)(this.path);
  }

  *decorations() {
    const pp = this.parsedPath;

    if (!pp) {
      return;
    }

    const uri = this.parent.uri;
    const pos = (0, _vscodeLanguageserverTypes2.Range_fromNode)(this.path_literal_node).start;
    const xxx = {
      path_punctuation: pp.punctuationIndexes,
      path_slash: pp.slashIndexes,
      path_parameter: pp.paramRanges,
      path_parameter_type: pp.paramTypeRanges
    };

    for (const style of (0, _keys.default)(xxx)) {
      for (const x of xxx[style]) {
        yield {
          kind: 'Decoration',
          style: style,
          location: loc(x)
        };
      }
    }

    function loc(x) {
      if (typeof x === 'number') {
        return loc([x, x + 1]);
      } else {
        const start = (0, _vscodeLanguageserverTypes2.Position_translate)(pos, 0, x[0] + 1);
        const end = (0, _vscodeLanguageserverTypes2.Position_translate)(pos, 0, x[1] + 1);
        return {
          uri,
          range: _vscodeLanguageserverTypes.Range.create(start, end)
        };
      }
    }
  } // TODO: we should get the URL of the server dynamically


  get sampleLocalPreviewURL() {
    const {
      path
    } = this;

    if (!path) {
      return undefined;
    }

    if ((0, _includes.default)(path).call(path, '{')) {
      return undefined;
    }

    return `http://localhost:8910${path}`;
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "id", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "id"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "location", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "location"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "isPrivate", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "isPrivate"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "hasParameters", [_dec4], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "hasParameters"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "hasPrerender", [_dec5], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "hasPrerender"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "hasPreRenderInfo", [_dec6], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "hasPreRenderInfo"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "outlineLabel", [_dec7], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "outlineLabel"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "outlineDescription", [_dec8], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "outlineDescription"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "outlineLink", [_dec9], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "outlineLink"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "page", [_dec10], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "page"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "page_identifier", [_dec11], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "page_identifier"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "page_identifier_str", [_dec12], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "page_identifier_str"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "name", [_dec13], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "name"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "path_errorMessage", [_dec14], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "path_errorMessage"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "path", [_dec15], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "path"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "prerender", [_dec16], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "prerender"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "path_literal_node", [_dec17], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "path_literal_node"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "isNotFound", [_dec18], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "isNotFound"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "hasPathCollision", [_dec19], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "hasPathCollision"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "parsedPath", [_dec20], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "parsedPath"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "sampleLocalPreviewURL", [_dec21], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "sampleLocalPreviewURL"), _class.prototype)), _class));
exports.RWRoute = RWRoute;