"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.OutlineManager = void 0;

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _outline = require("../outline/outline");

var _decorators = require("../x/decorators");

var _vscode = require("../x/vscode");

var _dec, _class;

let OutlineManager = (_dec = (0, _decorators.memo)(), (_class = class OutlineManager {
  constructor(server) {
    this.server = server;
  }

  start() {
    const getRoot = () => {
      const p = this.server.getProject();

      if (!p) {
        return {
          async children() {
            return [{
              label: 'No Redwood.js project found...'
            }];
          }

        };
      }

      return (0, _outline.getOutline)(p);
    };

    const tdp = new _vscode.RemoteTreeDataProviderImpl(getRoot);
    const methodPrefix = 'redwoodjs/x-outline-';
    (0, _vscode.RemoteTreeDataProvider_publishOverLSPConnection)(tdp, this.server.connection, methodPrefix);
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "start", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "start"), _class.prototype)), _class));
exports.OutlineManager = OutlineManager;