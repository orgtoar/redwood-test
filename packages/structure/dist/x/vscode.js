"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Command_cli = Command_cli;
exports.Command_open = Command_open;
exports.ProviderResult_normalize = ProviderResult_normalize;
exports.RemoteTreeDataProviderImpl = void 0;
exports.RemoteTreeDataProvider_publishOverLSPConnection = RemoteTreeDataProvider_publishOverLSPConnection;
exports.TreeItemCollapsibleState2 = exports.TreeItem2Wrapper = void 0;
exports.VSCodeWindowMethods_fromConnection = VSCodeWindowMethods_fromConnection;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _lodash = require("lodash");

var _vscodeLanguageserverTypes = require("vscode-languageserver-types");

var _decorators = require("../x/decorators");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _dec9, _class2;

function VSCodeWindowMethods_fromConnection(connection) {
  return new VSCodeWindowMethodsWrapper(connection);
}
/**
 * these methods are exposed by decoupled studio only
 */


class VSCodeWindowMethodsWrapper {
  constructor(connection) {
    this.connection = connection;
  }

  showQuickPick(...args) {
    return this.connection.sendRequest('xxx/showQuickPick', args);
  }

  showInformationMessage(...args) {
    return this.connection.sendRequest('xxx/showInformationMessage', args);
  }

  showInputBox(...args) {
    return this.connection.sendRequest('xxx/showInputBox', args);
  }

  createTerminal2(props) {
    return this.connection.sendRequest('xxx/createTerminal2', [props]);
  }

  withProgress(_options, task) {
    // TODO:
    return task();
  }

}

let TreeItem2Wrapper = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), _dec3 = (0, _decorators.lazy)(), _dec4 = (0, _decorators.lazy)(), _dec5 = (0, _decorators.memo)(), _dec6 = (0, _decorators.memo)(), _dec7 = (0, _decorators.memo)(JSON.stringify), _dec8 = (0, _decorators.lazy)(), (_class = class TreeItem2Wrapper {
  constructor(item, parent, indexInParent = 0) {
    this.item = item;
    this.parent = parent;
    this.indexInParent = indexInParent;
  }

  get keys() {
    var _this$parent$keys, _this$parent;

    if (!this.parent) {
      return [];
    }

    return [...((_this$parent$keys = (_this$parent = this.parent) === null || _this$parent === void 0 ? void 0 : _this$parent.keys) !== null && _this$parent$keys !== void 0 ? _this$parent$keys : []), this.key];
  }

  get key() {
    const {
      indexInParent,
      item: {
        key,
        label
      }
    } = this;

    if (key) {
      return key;
    }

    return (label !== null && label !== void 0 ? label : '') + '-' + indexInParent;
  }

  get id() {
    return JSON.stringify(this.keys);
  }

  get collapsibleState() {
    var _this$item$collapsibl;

    return (_this$item$collapsibl = this.item.collapsibleState) !== null && _this$item$collapsibl !== void 0 ? _this$item$collapsibl : this.item.children ? TreeItemCollapsibleState2.Collapsed : TreeItemCollapsibleState2.None;
  }

  async children() {
    var _this$item$children, _this$item;

    const cs = await ProviderResult_normalize((_this$item$children = (_this$item = this.item).children) === null || _this$item$children === void 0 ? void 0 : _this$item$children.call(_this$item));
    return (cs !== null && cs !== void 0 ? cs : []).map((c, i) => new TreeItem2Wrapper(c, this, i));
  }

  async findChild(key) {
    for (const c of await this.children()) {
      if (c.key === key) {
        return c;
      }
    }
  }

  async findChildRec(keys) {
    var _await$this$findChild;

    if (keys.length === 0) {
      return this;
    }

    const [k, ...rest] = keys;
    return await ((_await$this$findChild = await this.findChild(k)) === null || _await$this$findChild === void 0 ? void 0 : _await$this$findChild.findChildRec(rest));
  }

  get serializableTreeItem() {
    return { ...this.item,
      id: this.id,
      collapsibleState: this.collapsibleState
    };
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "keys", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "keys"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "key", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "key"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "id", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "id"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "collapsibleState", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "collapsibleState"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "children", [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, "children"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "findChild", [_dec6], Object.getOwnPropertyDescriptor(_class.prototype, "findChild"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "findChildRec", [_dec7], Object.getOwnPropertyDescriptor(_class.prototype, "findChildRec"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "serializableTreeItem", [_dec8], Object.getOwnPropertyDescriptor(_class.prototype, "serializableTreeItem"), _class.prototype)), _class));
/**
 * https://microsoft.github.io/vscode-codicons/dist/codicon.html
 * plust a few extra icons provided by decoupled studio:
 * - redwood
 * - prisma
 * - graphql
 * - netlify
 */

exports.TreeItem2Wrapper = TreeItem2Wrapper;

/**
 * A copy of vscode.TreeItemCollapsibleState
 * we don't want to have a runtime dependency on the vscode package
 */
let TreeItemCollapsibleState2;
/**
 * A vscode.TreeDataProvider that uses string IDs as elements
 * and returns a SerializableTreeItem.
 */

exports.TreeItemCollapsibleState2 = TreeItemCollapsibleState2;

(function (TreeItemCollapsibleState2) {
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["None"] = 0] = "None";
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["Collapsed"] = 1] = "Collapsed";
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["Expanded"] = 2] = "Expanded";
})(TreeItemCollapsibleState2 || (exports.TreeItemCollapsibleState2 = TreeItemCollapsibleState2 = {}));

let RemoteTreeDataProviderImpl = (_dec9 = (0, _decorators.memo)(), (_class2 = class RemoteTreeDataProviderImpl {
  constructor(getRoot, refreshInterval = 5000) {
    this.getRoot = getRoot;
    this.refreshInterval = refreshInterval;
    this.root = void 0;
    this.listeners = [];
  }

  refresh() {
    this.root = new TreeItem2Wrapper(this.getRoot());
  }

  lazyInit() {
    this.refresh();
    setInterval(() => {
      this.refresh();

      for (const l of this.listeners) {
        l(undefined);
      }
    }, this.refreshInterval);
  } // ----- start TreeDataProvider impl


  onDidChangeTreeData(listener) {
    this.lazyInit();
    this.listeners.push(listener); // eslint-disable-next-line @typescript-eslint/no-explicit-any

    return null; // TODO: disposable (we're not using it for now)
  }

  async getTreeItem(id) {
    this.lazyInit(); //console.log('getTreeItem', id)

    const keys = JSON.parse(id);
    const item = await this.root.findChildRec(keys);

    if (!item) {
      throw new Error(`item not found for id ${id}`);
    } //console.log('--->', item.treeItemOverTheWire)


    return item.serializableTreeItem;
  }

  async getChildren(id) {
    this.lazyInit(); //console.log('getChildren', id)

    const keys = id ? JSON.parse(id) : [];
    const self = await this.root.findChildRec(keys);
    const children = await (self === null || self === void 0 ? void 0 : self.children());

    if (!children) {
      return [];
    }

    const res = children === null || children === void 0 ? void 0 : children.map(c => c.id); //console.log('--->', res)

    return res;
  } //   getParent(id: string) {
  //     return null as any
  //   }
  // ----- end TreeDataProvider impl


}, ((0, _applyDecoratedDescriptor2.default)(_class2.prototype, "lazyInit", [_dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "lazyInit"), _class2.prototype)), _class2));
exports.RemoteTreeDataProviderImpl = RemoteTreeDataProviderImpl;

function RemoteTreeDataProvider_publishOverLSPConnection(tdp, connection, methodPrefix) {
  const lazyInit = (0, _lodash.memoize)(() => {
    var _tdp$onDidChangeTreeD;

    // we only setup this listener if we receive a call
    (_tdp$onDidChangeTreeD = tdp.onDidChangeTreeData) === null || _tdp$onDidChangeTreeD === void 0 ? void 0 : _tdp$onDidChangeTreeD.call(tdp, id => connection.sendRequest(`${methodPrefix}onDidChangeTreeData`, [id]));
  });
  connection.onRequest(`${methodPrefix}getChildren`, async id => {
    lazyInit();

    try {
      return await ProviderResult_normalize(tdp.getChildren(id));
    } catch (e) {
      return [];
    }
  });
  connection.onRequest(`${methodPrefix}getTreeItem`, async id => {
    lazyInit();

    try {
      return await ProviderResult_normalize(tdp.getTreeItem(id));
    } catch (e) {
      return {
        label: '(project has too many errors)',
        tooltip: e + ''
      };
    }
  });
}

async function ProviderResult_normalize(x) {
  if (isThenable(x)) {
    return await ProviderResult_normalize(await x);
  }

  if (x === null) {
    return undefined;
  }

  return x;
}

function isThenable(x) {
  if (typeof x !== 'object') {
    return false;
  }

  if (x === null) {
    return false;
  }

  return typeof x['then'] === 'function';
}

function Command_open(uriOrLocation) {
  const {
    uri,
    range
  } = _vscodeLanguageserverTypes.Location.is(uriOrLocation) ? uriOrLocation : {
    uri: uriOrLocation,
    range: undefined
  };

  if (uri.startsWith('https') || uri.startsWith('http')) {
    return {
      command: 'vscode.open',
      arguments: [uri],
      title: 'open'
    };
  }

  return {
    command: 'vscode.open',
    arguments: [uri, {
      selection: range,
      preserveFocus: true
    }],
    title: 'open'
  };
}

function Command_cli(cmd, title = 'run...') {
  cmd = cmd.trim();

  if (!(cmd.startsWith('rw') || cmd.startsWith('redwood'))) {
    cmd = 'redwood ' + cmd;
  }

  return {
    command: 'redwoodjs.cli',
    arguments: [cmd],
    title
  };
} // eslint-disable-next-line @typescript-eslint/ban-types