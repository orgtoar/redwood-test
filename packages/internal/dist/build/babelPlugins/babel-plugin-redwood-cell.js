"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

// This wraps a file that has a suffix of `Cell` in Redwood's `createCell` higher
// order component. The HOC deals with the lifecycle methods during a GraphQL query.
//
// ```js
// import { createCell } from '@redwoodjs/web'
// <YOUR CODE>
// export default createCell({ QUERY, Loading, Success, Failure, isEmpty, Empty, beforeQuery, afterQuery, displayName })
// ```
// A cell can export the declarations below.
const EXPECTED_EXPORTS_FROM_CELL = ['beforeQuery', 'QUERY', 'isEmpty', 'afterQuery', 'Loading', 'Success', 'Failure', 'Empty'];

function _default({
  types: t
}) {
  // This array will
  // - collect exports from the Cell file during ExportNamedDeclaration
  // - collected exports will then be passed to `createCell`
  // - be cleared after Program exit to prepare for the next file
  let exportNames = [];
  let hasDefaultExport = false;
  return {
    name: 'babel-plugin-redwood-cell',
    visitor: {
      ExportDefaultDeclaration() {
        hasDefaultExport = true;
        return;
      },

      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration;

        if (!declaration) {
          return;
        }

        let name;

        if (declaration.type === 'VariableDeclaration') {
          const id = declaration.declarations[0].id;
          name = id.name;
        }

        if (declaration.type === 'FunctionDeclaration') {
          var _declaration$id;

          name = declaration === null || declaration === void 0 ? void 0 : (_declaration$id = declaration.id) === null || _declaration$id === void 0 ? void 0 : _declaration$id.name;
        }

        if (name && EXPECTED_EXPORTS_FROM_CELL.includes(name)) {
          exportNames.push(name);
        }
      },

      Program: {
        exit(path) {
          // Validate that this file has exports which are "cell-like":
          // If the user is not exporting `QUERY` and has a default export then
          // it's likely not a cell.
          if (hasDefaultExport && !exportNames.includes('QUERY')) {
            return;
          } // Insert at the top of the file:
          // + import { createCell } from '@redwoodjs/web'


          path.node.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('createCell'), t.identifier('createCell'))], t.stringLiteral('@redwoodjs/web'))); // Insert at the bottom of the file:
          // + export default createCell({ QUERY?, Loading?, Succes?, Failure?, Empty?, beforeQuery?, isEmpty, afterQuery?, displayName? })

          path.node.body.push(t.exportDefaultDeclaration(t.callExpression(t.identifier('createCell'), [t.objectExpression([...exportNames.map(name => t.objectProperty(t.identifier(name), t.identifier(name), false, true)),
          /**
           * Add the `displayName` property
           * so we can name the Cell after the filename.
           */
          t.objectProperty(t.identifier('displayName'), t.stringLiteral((0, _path.parse)(this.file.opts.filename).name), false, true)])])));
          hasDefaultExport = false;
          exportNames = [];
        }

      }
    }
  };
}