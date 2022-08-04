"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _tasuku = _interopRequireDefault(require("tasuku"));

var _renameApiProxyPath = require("./renameApiProxyPath");

const command = 'rename-api-proxy-path';
exports.command = command;
const description = '(v0.37->v0.38) Renames apiProxyPath to apiURL';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Rename apiProxyPath', async () => {
    (0, _renameApiProxyPath.renameApiProxyPath)();
  });
};

exports.handler = handler;