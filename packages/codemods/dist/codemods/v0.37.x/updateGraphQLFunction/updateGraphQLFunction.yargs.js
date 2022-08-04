"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = void 0;

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _tasuku = _interopRequireDefault(require("tasuku"));

var _runTransform = _interopRequireDefault(require("../../../lib/runTransform"));

const command = 'update-graphql-function';
exports.command = command;
const description = '(v0.36->v0.37) Updates the imports and createGraphQLHandler in the GraphQL Function';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Updating the GraphQL Function', async () => {
    await (0, _runTransform.default)({
      transformPath: _path.default.join(__dirname, 'updateGraphQLFunction.js'),
      targetPaths: _fastGlob.default.sync('api/src/functions/graphql.{js,ts}')
    });
  });
};

exports.handler = handler;