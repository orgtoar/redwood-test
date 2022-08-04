"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _tasuku = _interopRequireDefault(require("tasuku"));

var _addDirectives = require("./addDirectives");

const command = 'add-directives';
exports.command = command;
const description = '(v0.36->v0.37) Add the directives directory from create-redwood-app template';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Add directives', async () => {
    await (0, _addDirectives.addDirectives)();
  });
};

exports.handler = handler;