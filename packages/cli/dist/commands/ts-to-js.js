"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = void 0;

var _paths = require("@redwoodjs/internal/dist/paths");

var _ts2js = require("@redwoodjs/internal/dist/ts2js");

const command = 'ts-to-js';
exports.command = command;
const description = 'Convert a TypeScript project to JavaScript';
exports.description = description;

const handler = () => {
  (0, _ts2js.convertTsProjectToJs)((0, _paths.getPaths)().base);
  (0, _ts2js.convertTsScriptsToJs)((0, _paths.getPaths)().base);
};

exports.handler = handler;