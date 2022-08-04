"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasDefaultExport = exports.getNamedExports = exports.getGqlQueries = exports.getCellGqlQuery = exports.fileToAst = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _core = require("@babel/core");

var _parser = require("@babel/parser");

var _traverse = _interopRequireDefault(require("@babel/traverse"));

var _chalk = _interopRequireDefault(require("chalk"));

var _files = require("./files");

var _paths = require("./paths");

const fileToAst = filePath => {
  const code = _fs.default.readFileSync(filePath, 'utf-8'); // use jsx plugin for web files, because in JS, the .jsx extension is not used


  const isJsxFile = _path.default.extname(filePath).match(/[jt]sx$/) || (0, _files.isFileInsideFolder)(filePath, (0, _paths.getPaths)().web.base);
  const plugins = ['typescript', 'nullishCoalescingOperator', 'objectRestSpread', isJsxFile && 'jsx'].filter(Boolean);

  try {
    return (0, _parser.parse)(code, {
      sourceType: 'module',
      plugins
    });
  } catch (e) {
    console.error(_chalk.default.red(`Error parsing: ${filePath}`));
    console.error(e);
    throw new Error(e === null || e === void 0 ? void 0 : e.message); // we throw, so typescript doesn't complain about returning
  }
};

exports.fileToAst = fileToAst;

/**
 * get all the named exports in a given piece of code.
 */
const getNamedExports = ast => {
  const namedExports = [];
  (0, _traverse.default)(ast, {
    ExportNamedDeclaration(path) {
      var _path$node;

      // Re-exports from other modules
      // Eg: export { a, b } from './module'
      const specifiers = (_path$node = path.node) === null || _path$node === void 0 ? void 0 : _path$node.specifiers;

      if (specifiers.length) {
        for (const s of specifiers) {
          const id = s.exported;
          namedExports.push({
            name: id.name,
            type: 're-export'
          });
        }

        return;
      }

      const declaration = path.node.declaration;

      if (!declaration) {
        return;
      }

      if (declaration.type === 'VariableDeclaration') {
        const id = declaration.declarations[0].id;
        namedExports.push({
          name: id.name,
          type: 'variable'
        });
      } else if (declaration.type === 'FunctionDeclaration') {
        var _declaration$id;

        namedExports.push({
          name: declaration === null || declaration === void 0 ? void 0 : (_declaration$id = declaration.id) === null || _declaration$id === void 0 ? void 0 : _declaration$id.name,
          type: 'function'
        });
      } else if (declaration.type === 'ClassDeclaration') {
        var _declaration$id2;

        namedExports.push({
          name: declaration === null || declaration === void 0 ? void 0 : (_declaration$id2 = declaration.id) === null || _declaration$id2 === void 0 ? void 0 : _declaration$id2.name,
          type: 'class'
        });
      }
    }

  });
  return namedExports;
};
/**
 * get all the gql queries from the supplied code
 */


exports.getNamedExports = getNamedExports;

const getGqlQueries = ast => {
  const gqlQueries = [];
  (0, _traverse.default)(ast, {
    TaggedTemplateExpression(path) {
      const gqlTag = path.node.tag;

      if (gqlTag.type === 'Identifier' && gqlTag.name === 'gql') {
        gqlQueries.push(path.node.quasi.quasis[0].value.raw);
      }
    }

  });
  return gqlQueries;
};

exports.getGqlQueries = getGqlQueries;

const getCellGqlQuery = ast => {
  let cellQuery = undefined;
  (0, _traverse.default)(ast, {
    ExportNamedDeclaration({
      node
    }) {
      if (node.exportKind === 'value' && _core.types.isVariableDeclaration(node.declaration)) {
        const exportedQueryNode = node.declaration.declarations.find(d => {
          return _core.types.isIdentifier(d.id) && d.id.name === 'QUERY' && _core.types.isTaggedTemplateExpression(d.init);
        });

        if (exportedQueryNode) {
          const templateExpression = exportedQueryNode.init;
          cellQuery = templateExpression.quasi.quasis[0].value.raw;
        }
      }

      return;
    }

  });
  return cellQuery;
};

exports.getCellGqlQuery = getCellGqlQuery;

const hasDefaultExport = ast => {
  let exported = false;
  (0, _traverse.default)(ast, {
    ExportDefaultDeclaration() {
      exported = true;
      return;
    }

  });
  return exported;
};

exports.hasDefaultExport = hasDefaultExport;