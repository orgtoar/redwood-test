"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = _default;

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));

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
        var _context;

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

        switch (d?.type) {
          case 'VariableDeclaration':
            // If its an arrow function
            // or export standard = function()
            {
              const standardMockExport = d.declarations[0];
              const id = standardMockExport.id;
              const exportName = id?.name;

              if (exportName !== 'standard') {
                return;
              }

              const mockFunctionMaybe = standardMockExport?.init;

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
              const exportName = d.id?.name;

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
        const cell = (0, _find.default)(_context = project.cells).call(_context, path => {
          var _context2;

          return (0, _startsWith.default)(_context2 = path.uri).call(_context2, dir);
        });

        if (!cell || !cell?.filePath) {
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