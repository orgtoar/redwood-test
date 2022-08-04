"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _tasuku = _interopRequireDefault(require("tasuku"));

var _updateNodeEngine = require("./updateNodeEngine");

const command = 'update-node-engine';
exports.command = command;
const description = '(v0.37->v0.38) Update the node engine field in the root package.json';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Update node engine', async () => {
    (0, _updateNodeEngine.updateNodeEngine)();
  });
};

exports.handler = handler;