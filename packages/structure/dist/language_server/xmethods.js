"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.XMethodsManager = void 0;

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _decorators = require("../x/decorators");

var _dec, _class;

/**
 * A set of custom methods (not included in the LSP spec) exposed to the client
 * via the sendRequest/onRequest mechanism.
 */
let XMethodsManager = (_dec = (0, _decorators.memo)(), (_class = class XMethodsManager {
  constructor(server) {
    this.server = server;
  }

  start() {
    const {
      server
    } = this;
    const {
      connection
    } = server;
    connection.onRequest('redwoodjs/x-getInfo', async uri => {
      var _server$getProject;

      const node = await ((_server$getProject = server.getProject()) === null || _server$getProject === void 0 ? void 0 : _server$getProject.findNode(uri));

      if (!node) {
        return undefined;
      }

      return await node.collectIDEInfo();
    });
    connection.onRequest('redwoodjs/x-getFilePathForRoutePath', routePath => {
      var _server$getProject2;

      return (_server$getProject2 = server.getProject()) === null || _server$getProject2 === void 0 ? void 0 : _server$getProject2.router.getFilePathForRoutePath(routePath);
    });
    connection.onRequest('redwoodjs/x-getRoutePathForFilePath', uri => {
      var _server$getProject3;

      return (_server$getProject3 = server.getProject()) === null || _server$getProject3 === void 0 ? void 0 : _server$getProject3.router.getRoutePathForFilePath(uri);
    });
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "start", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "start"), _class.prototype)), _class));
exports.XMethodsManager = XMethodsManager;