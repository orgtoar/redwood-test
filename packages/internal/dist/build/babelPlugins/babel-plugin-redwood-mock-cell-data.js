"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

require("core-js/modules/esnext.async-iterator.find.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.find.js");

var _path = _interopRequireDefault(require("path"));

var _paths = require("../../paths");

const {
  getProject,
  URL_file
} = require('@redwoodjs/structure');

function _default({
  types: t
}) {
  let nodesToRemove = [];
  let nodesToInsert = []; // export const standard = ${ex}

  const createExportStandard = ex => t.exportNamedDeclaration(t.variableDeclaration('const', [t.variableDeclarator(t.identifier('standard'), ex)]));

  return {
    name: 'babel-plugin-redwood-mock-cell-data',
    visitor: {
      Program: {
        enter() {
          nodesToRemove = [];
          nodesToInsert = [];
        },

        exit(p) {
          for (const n of nodesToRemove) {
            n.remove();
          } // Insert at the top of the file


          p.node.body.unshift(...nodesToInsert);
        }

      },

      ExportNamedDeclaration(p, state) {
        // This converts a standard export into a "mockGraphQLQuery" by automatically:
        // Determining the query operation name for `QUERY` and,
        // wrapping the exported data in `afterQuery`
        //
        // Rules:
        // 1. Must be a *.mock.[ts,js] file.
        // 2. That has a named export called "standard".
        // 3. That are adjacent to a Cell.
        // 4. The Cell has a operation name for the QUERY export.
        const d = p.node.declaration;
        const filename = state.file.opts.filename;
        let mockFunction; // Only auto-mock the standard export

        switch (d === null || d === void 0 ? void 0 : d.type) {
          case 'VariableDeclaration':
            // If its an arrow function
            // or export standard = function()
            {
              const standardMockExport = d.declarations[0];
              const id = standardMockExport.id;
              const exportName = id === null || id === void 0 ? void 0 : id.name;

              if (exportName !== 'standard') {
                return;
              }

              const mockFunctionMaybe = standardMockExport === null || standardMockExport === void 0 ? void 0 : standardMockExport.init;

              if (!mockFunctionMaybe) {
                return;
              } // If they're not exporting a function, blow up


              if (mockFunctionMaybe.type !== 'ArrowFunctionExpression' && mockFunctionMaybe.type !== 'FunctionExpression') {
                throw new Error(`\n \n Mock Error: You must export your standard mock as a function \n \n`);
              }

              mockFunction = mockFunctionMaybe;
            }
            break;

          case 'FunctionDeclaration':
            {
              var _d$id;

              const exportName = (_d$id = d.id) === null || _d$id === void 0 ? void 0 : _d$id.name;

              if (exportName !== 'standard') {
                return;
              } // if its a normal function export e.g. export function standard()
              // convert the named FunctionDeclaration to an arrow func i.e. (..args)=>{//originalbody here}


              mockFunction = t.arrowFunctionExpression(d.params, d.body);
            }
            break;

          default:
            // If it isn't a mock function called standard, ignore it
            return;
        } // Find the model of the Cell that is in the same directory.


        const dir = URL_file(_path.default.dirname(state.file.opts.filename));
        const project = getProject((0, _paths.getBaseDirFromFile)(filename));
        const cell = project.cells.find(path => {
          return path.uri.startsWith(dir);
        });

        if (!cell || !(cell !== null && cell !== void 0 && cell.filePath)) {
          return;
        }

        if (!cell.queryOperationName) {
          return;
        } // mockGraphQLQuery(<operationName>, <mockFunction>)


        const mockGraphQLCall = t.callExpression(t.identifier('mockGraphQLQuery'), [t.stringLiteral(cell.queryOperationName), mockFunction]); // Delete original "export const standard"

        nodesToRemove = [...nodesToRemove, p]; // + import { afterQuery } from './${cellFileName}'
        // + export const standard = () => afterQuery(...)

        if (cell.exportedSymbols.has('afterQuery')) {
          const importAfterQuery = t.importDeclaration([t.importSpecifier(t.identifier('afterQuery'), t.identifier('afterQuery'))], t.stringLiteral(`./${_path.default.basename(cell.filePath)}`));
          nodesToInsert = [...nodesToInsert, importAfterQuery, createExportStandard(t.arrowFunctionExpression([], t.callExpression(t.identifier('afterQuery'), [t.callExpression(mockGraphQLCall, [])])))];
        } else {
          // + export const standard = mo
          nodesToInsert = [...nodesToInsert, createExportStandard(mockGraphQLCall)];
        }
      }

    }
  };
}