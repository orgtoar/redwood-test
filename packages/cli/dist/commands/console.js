"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.aliases = void 0;
const command = exports.command = 'console';
const aliases = exports.aliases = ['c'];
const description = exports.description = 'Launch an interactive Redwood shell (experimental)';
const handler = async options => {
  const {
    handler
  } = await import('./consoleHandler.js');
  return handler(options);
};
exports.handler = handler;