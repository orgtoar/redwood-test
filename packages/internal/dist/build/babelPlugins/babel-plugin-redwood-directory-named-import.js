"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = _default;

var _path = _interopRequireDefault(require("path"));

var _paths = require("../../paths");

const getNewPath = (value, filename) => {
  const dirname = _path.default.dirname(value);

  const basename = _path.default.basename(value); // We try to resolve `index.[js*|ts*]` modules first,
  // since that's the desired default behaviour


  const indexImportPath = [dirname, basename, 'index'].join('/');

  if ((0, _paths.resolveFile)(_path.default.resolve(_path.default.dirname(filename), indexImportPath))) {
    return indexImportPath;
  } else {
    // No index file found, so try to import the directory-named-module instead
    const dirnameImportPath = [dirname, basename, basename].join('/');

    if ((0, _paths.resolveFile)(_path.default.resolve(_path.default.dirname(filename), dirnameImportPath))) {
      return dirnameImportPath;
    }
  }

  return null;
};

function _default({
  types: t
}) {
  return {
    visitor: {
      ImportDeclaration(p, state) {
        const {
          value
        } = p.node.source; // import xyz from <value>

        const {
          filename
        } = state.file.opts; // the file where this import statement resides
        // We only operate in "userland," skip node_modules.

        if (filename?.includes('/node_modules/')) {
          return;
        } // We only need this plugin in the module could not be found.


        try {
          require.resolve(value);

          return; // ABORT
        } catch {// CONTINUE...
        }

        const newPath = getNewPath(value, filename);

        if (!newPath) {
          return;
        }

        const newSource = t.stringLiteral(newPath);
        p.node.source = newSource;
      },

      ExportDeclaration(p, state) {
        // @ts-expect-error - TypeDef must be outdated.
        if (!p?.node?.source) {
          return;
        } // @ts-expect-error - TypeDef must be outdated.


        const {
          value
        } = p.node.source;
        const {
          filename
        } = state.file.opts; // We only operate in "userland," skip node_modules.

        if (filename?.includes('/node_modules/')) {
          return;
        } // We only need this plugin in the module could not be found.


        try {
          require.resolve(value);

          return; // ABORT, since the file was resolved
        } catch {// CONTINUE...
        }

        const newPath = getNewPath(value, filename);

        if (!newPath) {
          return;
        }

        const newSource = t.stringLiteral(newPath); // @ts-expect-error - TypeDef must be outdated.

        p.node.source = newSource;
      }

    }
  };
}