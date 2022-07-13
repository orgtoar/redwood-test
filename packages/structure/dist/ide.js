"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.HostWithDocumentsStore = exports.FileNode = exports.BaseNode = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _flat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/flat"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _path = require("path");

var _vscodeLanguageserverTypes = require("vscode-languageserver-types");

var _hosts = require("./hosts");

var _Array = require("./x/Array");

var _decorators = require("./x/decorators");

var _path2 = require("./x/path");

var _tsMorph = require("./x/ts-morph");

var _URL = require("./x/URL");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class3;

let BaseNode = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.memo)(), _dec3 = (0, _decorators.memo)(), _dec4 = (0, _decorators.memo)(), _dec5 = (0, _decorators.memo)(_stringify.default), _dec6 = (0, _decorators.memo)(_stringify.default), _dec7 = (0, _decorators.lazy)(), _dec8 = (0, _decorators.memo)(), (_class = class BaseNode {
  constructor() {
    this.exists = true;
  }

  get host() {
    if (this.parent) {
      return this.parent.host;
    }

    throw new Error("Could not find host implementation on root node (you must override the 'host' gettter)");
  }

  /**
   * Returns the children of this node.
   * Override this.
   */
  children() {
    return [];
  }

  _children() {
    return (0, _Array.ArrayLike_normalize)(this.children());
  }
  /**
   * Diagnostics for this node (must not include children's diagnostics).
   * Override this.
   */


  diagnostics() {
    return [];
  }

  _diagnostics() {
    return (0, _Array.ArrayLike_normalize)(this.diagnostics());
  }
  /**
   * IDE info for this node.
   * Override this.
   */


  ideInfo() {
    return [];
  }

  _ideInfo() {
    return (0, _Array.ArrayLike_normalize)(this.ideInfo());
  }

  async collectIDEInfo(uri) {
    if (uri && this.bailOutOnCollection(uri)) {
      return [];
    }

    try {
      var _context;

      const d1 = await this._ideInfo();
      const dd = await _promise.default.all((0, _map.default)(_context = await this._children()).call(_context, c => c.collectIDEInfo(uri)));
      const d2 = (0, _flat.default)(dd).call(dd);
      let all = [...d1, ...d2];

      if (uri) {
        all = (0, _filter.default)(all).call(all, x => x.location.uri === uri);
      }

      return all;
    } catch (e) {
      // TODO: this diagnostic is also interesting
      console.log(e);
      return [];
    }
  }
  /**
   * Collects diagnostics for this node and all descendants.
   * This is what you'll use to gather all the project diagnostics.
   */


  async collectDiagnostics(uri) {
    // TODO: catch runtime errors and add them as diagnostics
    // TODO: we can parallelize this further
    if (uri && this.bailOutOnCollection(uri)) {
      return [];
    }

    try {
      var _context2;

      const d1 = await this._diagnostics();
      const dd = await _promise.default.all((0, _map.default)(_context2 = await this._children()).call(_context2, c => c.collectDiagnostics(uri)));
      const d2 = (0, _flat.default)(dd).call(dd);
      let all = [...d1, ...d2];

      if (uri) {
        all = (0, _filter.default)(all).call(all, x => x.uri === uri);
      }

      return all;
    } catch (e) {
      const uri = this.closestContainingUri;

      if (!uri) {
        throw e;
      }

      const range = _vscodeLanguageserverTypes.Range.create(0, 0, 0, 0);

      return [{
        uri,
        diagnostic: {
          message: e + '',
          range
        }
      }];
    }
  }

  bailOutOnCollection(uri) {
    if (this.id === uri) {
      return false;
    }

    if ((0, _startsWith.default)(uri).call(uri, this.id)) {
      return false;
    }

    return true;
  }

  get closestContainingUri() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {
      uri
    } = this;

    if (uri) {
      return uri;
    }

    if (this.parent) {
      return this.parent.closestContainingUri;
    }

    return undefined;
  }
  /**
   * Finds a node by ID.
   * The default algorithm tries to be economic and only create the necessary
   * intermediate nodes.
   * Subclasses can override this to add further optimizations.
   * @param id
   */


  async findNode(id) {
    id = (0, _URL.URL_file)(id);

    if (this.id === id) {
      return this;
    }

    if ((0, _startsWith.default)(id).call(id, this.id)) {
      for (const c of await this._children()) {
        // depth first search by default
        const cc = await c.findNode(id);

        if (cc) {
          return cc;
        }
      }
    }

    return undefined;
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "host", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "host"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "_children", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "_children"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "_diagnostics", [_dec3], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "_diagnostics"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "_ideInfo", [_dec4], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "_ideInfo"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "collectIDEInfo", [_dec5], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "collectIDEInfo"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "collectDiagnostics", [_dec6], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "collectDiagnostics"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "closestContainingUri", [_dec7], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "closestContainingUri"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "findNode", [_dec8], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "findNode"), _class.prototype)), _class));
exports.BaseNode = BaseNode;
let FileNode = (_dec9 = (0, _decorators.lazy)(), _dec10 = (0, _decorators.lazy)(), _dec11 = (0, _decorators.lazy)(), _dec12 = (0, _decorators.lazy)(), _dec13 = (0, _decorators.lazy)(), _dec14 = (0, _decorators.lazy)(), _dec15 = (0, _decorators.lazy)(), (_class3 = class FileNode extends BaseNode {
  get uri() {
    return (0, _URL.URL_file)(this.filePath);
  }
  /**
   * the ID of a FileNode is its file:// uri.
   */


  get id() {
    return this.uri;
  }

  get text() {
    return this.host.readFileSync(this.filePath);
  }

  get fileExists() {
    return this.host.existsSync(this.filePath);
  }
  /**
   * parsed ts-morph source file
   */


  get sf() {
    if (typeof this.text === 'undefined') {
      throw new Error('undefined file ' + this.filePath);
    }

    return (0, _tsMorph.createTSMSourceFile_cached)(this.filePath, this.text);
  }

  get basenameNoExt() {
    return (0, _path2.basenameNoExt)(this.filePath);
  }

  get basename() {
    return (0, _path.basename)(this.filePath);
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class3.prototype, "uri", [_dec9], (0, _getOwnPropertyDescriptor.default)(_class3.prototype, "uri"), _class3.prototype), (0, _applyDecoratedDescriptor2.default)(_class3.prototype, "id", [_dec10], (0, _getOwnPropertyDescriptor.default)(_class3.prototype, "id"), _class3.prototype), (0, _applyDecoratedDescriptor2.default)(_class3.prototype, "text", [_dec11], (0, _getOwnPropertyDescriptor.default)(_class3.prototype, "text"), _class3.prototype), (0, _applyDecoratedDescriptor2.default)(_class3.prototype, "fileExists", [_dec12], (0, _getOwnPropertyDescriptor.default)(_class3.prototype, "fileExists"), _class3.prototype), (0, _applyDecoratedDescriptor2.default)(_class3.prototype, "sf", [_dec13], (0, _getOwnPropertyDescriptor.default)(_class3.prototype, "sf"), _class3.prototype), (0, _applyDecoratedDescriptor2.default)(_class3.prototype, "basenameNoExt", [_dec14], (0, _getOwnPropertyDescriptor.default)(_class3.prototype, "basenameNoExt"), _class3.prototype), (0, _applyDecoratedDescriptor2.default)(_class3.prototype, "basename", [_dec15], (0, _getOwnPropertyDescriptor.default)(_class3.prototype, "basename"), _class3.prototype)), _class3));
exports.FileNode = FileNode;

class HostWithDocumentsStore {
  constructor(documents) {
    this.documents = documents;
    this.defaultHost = new _hosts.DefaultHost();
  }

  readFileSync(path) {
    const uri = (0, _URL.URL_file)(path);
    const doc = this.documents.get(uri);

    if (doc) {
      return doc.getText();
    }

    return this.defaultHost.readFileSync(path);
  }

  existsSync(path) {
    return this.defaultHost.existsSync(path);
  }

  readdirSync(path) {
    return this.defaultHost.readdirSync(path);
  }

  globSync(pattern) {
    return this.defaultHost.globSync(pattern);
  }

  writeFileSync(path, contents) {
    return this.defaultHost.writeFileSync(path, contents);
  }

  get paths() {
    return this.defaultHost.paths;
  }

}

exports.HostWithDocumentsStore = HostWithDocumentsStore;