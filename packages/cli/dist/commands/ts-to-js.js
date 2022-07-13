"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = void 0;

var _internal = require("@redwoodjs/internal");

const command = 'ts-to-js';
exports.command = command;
const description = 'Convert a TypeScript project to JavaScript';
exports.description = description;

const handler = () => {
  (0, _internal.convertTsProjectToJs)((0, _internal.getPaths)().base);
  (0, _internal.convertTsScriptsToJs)((0, _internal.getPaths)().base);
};

exports.handler = handler;