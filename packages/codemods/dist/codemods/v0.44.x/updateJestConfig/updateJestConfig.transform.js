"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = transform;

var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _fetchFileFromTemplate = _interopRequireDefault(require("../../../lib/fetchFileFromTemplate"));

// import { FileInfo, API } from 'jscodeshift'

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
async function transform(file, api) {
  var _context;

  // This is the easy case.
  const match = (0, _trim.default)(_context = file.source).call(_context).match(/module.exports = require\('@redwoodjs\/testing\/config\/jest\/(?<side>api|web)'\)/);

  if (match !== null && match !== void 0 && match.length) {
    var _match$groups;

    file.source = await (0, _fetchFileFromTemplate.default)('main', `${(_match$groups = match.groups) === null || _match$groups === void 0 ? void 0 : _match$groups.side}/jest.config.js`);
    return file.source;
  }

  const j = api.jscodeshift;
  const ast = j(file.source);
  const paths = (0, _find.default)(ast).call(ast, j.SpreadElement, {
    argument: {
      callee: {
        name: 'require'
      }
    }
  });
  const oldConfig = (0, _filter.default)(paths).call(paths, path => {
    return path.node.argument.arguments[0].value === '@redwoodjs/testing/config/jest/web';
  });
  oldConfig.replaceWith(["rootDir: '../'", "preset: '@redwoodjs/testing/config/jest/web'"].join(',\n'));
  return ast.toSource({
    trailingComma: true
  });
}