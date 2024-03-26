"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.builder = builder;
exports.description = exports.command = void 0;
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var fragmentsCommand = _interopRequireWildcard(require("./features/fragments/fragments"));
var trustedDocumentsCommand = _interopRequireWildcard(require("./features/trustedDocuments/trustedDocuments"));
const command = exports.command = 'graphql <feature>';
const description = exports.description = 'Set up GraphQL feature support';
function builder(yargs) {
  return yargs.command(fragmentsCommand).command(trustedDocumentsCommand).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup-graphql')}`);
}