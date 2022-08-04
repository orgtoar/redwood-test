"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transform;

require("core-js/modules/esnext.async-iterator.find.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.find.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.filter.js");

var _fetchFileFromTemplate = _interopRequireDefault(require("../../../lib/fetchFileFromTemplate"));

// import { FileInfo, API } from 'jscodeshift'

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
async function transform(file, api) {
  // This is the easy case.
  const match = file.source.trim().match(/module.exports = require\('@redwoodjs\/testing\/config\/jest\/(?<side>api|web)'\)/);

  if (match !== null && match !== void 0 && match.length) {
    var _match$groups;

    file.source = await (0, _fetchFileFromTemplate.default)('main', `${(_match$groups = match.groups) === null || _match$groups === void 0 ? void 0 : _match$groups.side}/jest.config.js`);
    return file.source;
  }

  const j = api.jscodeshift;
  const ast = j(file.source);
  const paths = ast.find(j.SpreadElement, {
    argument: {
      callee: {
        name: 'require'
      }
    }
  });
  const oldConfig = paths.filter(path => {
    return path.node.argument.arguments[0].value === '@redwoodjs/testing/config/jest/web';
  });
  oldConfig.replaceWith(["rootDir: '../'", "preset: '@redwoodjs/testing/config/jest/web'"].join(',\n'));
  return ast.toSource({
    trailingComma: true
  });
}