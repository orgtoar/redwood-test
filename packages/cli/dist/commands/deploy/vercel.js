"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = void 0;

var _helpers = require("./helpers/helpers");

const command = 'vercel [...commands]';
exports.command = command;
const description = 'Build command for Vercel deploy';
exports.description = description;

const builder = yargs => (0, _helpers.deployBuilder)(yargs);

exports.builder = builder;
const handler = _helpers.deployHandler;
exports.handler = handler;