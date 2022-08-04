"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = transform;

var _set = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/set"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

const apiExports = ['DbAuthHandler', 'dbAuthSession', 'getAuthProviderHeader', 'getAuthenticationContext', 'parseAuthorizationHeader', 'parseJWT', 'prismaVersion', 'redwoodVersion'];

function transform(file, api) {
  var _context;

  const j = api.jscodeshift;
  const ast = j(file.source);
  const apiSpecifiers = new _set.default();
  const graphqlServerSpecifiers = new _set.default(); // Find all named import statements from '@redwoodjs/api'.
  // Seprate their specifiers.

  (0, _forEach.default)(_context = (0, _find.default)(ast).call(ast, j.ImportDeclaration, {
    source: {
      value: '@redwoodjs/api'
    }
  })).call(_context, importDeclaration => {
    const {
      specifiers
    } = importDeclaration.node;
    specifiers?.forEach(specifier => {
      const {
        name
      } = specifier.imported;

      if ((0, _includes.default)(apiExports).call(apiExports, name)) {
        apiSpecifiers.add(name);
      } else {
        graphqlServerSpecifiers.add(name);
      }
    });
    j(importDeclaration).remove();
  }); // Insert new import declarations at the top.

  if (apiSpecifiers.size) {
    (0, _find.default)(ast).call(ast, j.Program).get('body', 0).insertBefore(`import { ${[...apiSpecifiers].join(', ')} } from '@redwoodjs/api'`);
  }

  if (graphqlServerSpecifiers.size) {
    (0, _find.default)(ast).call(ast, j.Program).get('body', 0).insertBefore(`import { ${[...graphqlServerSpecifiers].join(', ')} } from '@redwoodjs/graphql-server'`);
  }

  return ast.toSource();
}