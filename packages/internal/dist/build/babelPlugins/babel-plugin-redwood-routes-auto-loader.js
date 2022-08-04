"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = _default;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _path = _interopRequireDefault(require("path"));

var _paths = require("../../paths");

/**
 * When running from the CLI: Babel-plugin-module-resolver will convert
 * For dev/build/prerender (forJest == false): 'src/pages/ExamplePage' -> './pages/ExamplePage'
 * For test (forJest == true): 'src/pages/ExamplePage' -> '/Users/blah/pathToProject/web/src/pages/ExamplePage'
 */
const getPathRelativeToSrc = maybeAbsolutePath => {
  // If the path is already relative
  if (!_path.default.isAbsolute(maybeAbsolutePath)) {
    return maybeAbsolutePath;
  }

  return `./${_path.default.relative((0, _paths.getPaths)().web.src, maybeAbsolutePath)}`;
};

const withRelativeImports = page => {
  return { ...page,
    relativeImport: (0, _paths.ensurePosixPath)(getPathRelativeToSrc(page.importPath))
  };
};

function _default({
  types: t
}, {
  useStaticImports = false
}) {
  var _context;

  // @NOTE: This var gets mutated inside the visitors
  let pages = (0, _map.default)(_context = (0, _paths.processPagesDir)()).call(_context, withRelativeImports);
  return {
    name: 'babel-plugin-redwood-routes-auto-loader',
    visitor: {
      // Remove any pages that have been explicitly imported in the Routes file,
      // because when one is present, the user is requesting that the module be
      // included in the main bundle.
      ImportDeclaration(p) {
        var _p$node$source, _context2;

        if (pages.length === 0) {
          return;
        }

        const userImportRelativePath = getPathRelativeToSrc((0, _paths.importStatementPath)((_p$node$source = p.node.source) === null || _p$node$source === void 0 ? void 0 : _p$node$source.value));
        const defaultSpecifier = (0, _filter.default)(_context2 = p.node.specifiers).call(_context2, specifiers => t.isImportDefaultSpecifier(specifiers))[0]; // Remove Page imports in prerender mode (see babel-preset)
        // This is to make sure that all the imported "Page modules" are normal imports
        // and not asynchronous ones.
        // But note that jest in a user's project does not enter this block, but our tests do

        if (useStaticImports) {
          // Match import paths, const name could be different
          const pageThatUserImported = (0, _find.default)(pages).call(pages, page => {
            return page.relativeImport === (0, _paths.ensurePosixPath)(userImportRelativePath);
          });

          if (pageThatUserImported) {
            var _context3;

            // Update the import name, with the user's import name
            // So that the JSX name stays consistent
            pageThatUserImported.importName = defaultSpecifier.local.name; // Remove the default import for the page and leave all the others

            p.node.specifiers = (0, _filter.default)(_context3 = p.node.specifiers).call(_context3, specifier => !t.isImportDefaultSpecifier(specifier));
          }

          return;
        }

        if (userImportRelativePath && defaultSpecifier) {
          // Remove the page from pages list, if it is already explicitly imported, so that we don't add loaders for these pages.
          // We use the path & defaultSpecifier because the const name could be anything
          pages = (0, _filter.default)(pages).call(pages, page => !(page.relativeImport === (0, _paths.ensurePosixPath)(userImportRelativePath)));
        }
      },

      Program: {
        enter() {
          var _context4;

          pages = (0, _map.default)(_context4 = (0, _paths.processPagesDir)()).call(_context4, withRelativeImports);
        },

        exit(p) {
          if (pages.length === 0) {
            return;
          }

          const nodes = []; // Prepend all imports to the top of the file

          for (const {
            importName,
            relativeImport
          } of pages) {
            // + const <importName> = { name: <importName>, loader: () => import(<relativeImportPath>) }
            nodes.push(t.variableDeclaration('const', [t.variableDeclarator(t.identifier(importName), t.objectExpression([t.objectProperty(t.identifier('name'), t.stringLiteral(importName)), t.objectProperty(t.identifier('loader'), t.arrowFunctionExpression([], t.callExpression( // If useStaticImports, do a synchronous import with require (ssr/prerender)
            // otherwise do a dynamic import (browser)
            useStaticImports ? t.identifier('require') : t.identifier('import'), [t.stringLiteral(relativeImport)])))]))]));
          } // Insert at the top of the file


          p.node.body.unshift(...nodes);
        }

      }
    }
  };
}