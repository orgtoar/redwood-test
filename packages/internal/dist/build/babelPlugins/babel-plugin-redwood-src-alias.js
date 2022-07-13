"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = _default;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));

var _path = _interopRequireDefault(require("path"));

function _default({
  types: t
}, options) {
  return {
    name: 'babel-plugin-redwood-src-alias',
    visitor: {
      ImportDeclaration(p, state) {
        const {
          value
        } = p.node.source; // import xyz from <value>

        const {
          filename
        } = state.file.opts; // the file where this import statement resides
        // We only operate in "userland" so skip node_modules.
        // Skip everything that's not a 'src/' alias import.

        if (!filename || filename !== null && filename !== void 0 && (0, _includes.default)(filename).call(filename, '/node_modules/') || !(0, _startsWith.default)(value).call(value, 'src/')) {
          return;
        } // remove `src/` and create an absolute path


        const absPath = _path.default.join(options.srcAbsPath, value.substr(4));

        let newImport = _path.default.relative(_path.default.dirname(filename), absPath);

        if ((0, _indexOf.default)(newImport).call(newImport, '.') !== 0) {
          newImport = './' + newImport;
        }

        const newSource = t.stringLiteral(newImport);
        p.node.source = newSource;
      },

      ExportDeclaration(p, state) {
        var _p$node;

        // @ts-expect-error `source` does exist
        if (!(p !== null && p !== void 0 && (_p$node = p.node) !== null && _p$node !== void 0 && _p$node.source)) {
          return;
        } // @ts-expect-error `source` does exist


        const {
          value
        } = p.node.source;
        const {
          filename
        } = state.file.opts;

        if (!filename || filename !== null && filename !== void 0 && (0, _includes.default)(filename).call(filename, '/node_modules/') || !(0, _startsWith.default)(value).call(value, 'src/')) {
          return;
        } // remove `src/` and create an absolute path


        const absPath = _path.default.join(options.srcAbsPath, value.substr(4));

        const newImport = _path.default.relative(_path.default.dirname(filename), absPath);

        const newSource = t.stringLiteral(newImport); // @ts-expect-error `source` does exist

        p.node.source = newSource;
      }

    }
  };
}