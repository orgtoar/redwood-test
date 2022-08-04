"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = transform;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

function transform(file, api) {
  var _context, _context2;

  const j = api.jscodeshift;
  const ast = j(file.source); // STEP 1: Update imports

  (0, _forEach.default)(_context = (0, _find.default)(ast).call(ast, j.ImportDeclaration)).call(_context, path => {
    // 1. Updates import statement to be
    // import { createGraphqlServer } from '@redwoodjs/graphqlserver'
    if (path.value.source.value === '@redwoodjs/api') {
      j(path).replaceWith(j.importDeclaration([j.importSpecifier(j.identifier('createGraphQLHandler'))], j.literal('@redwoodjs/graphql-server')));
    } // 2. Update glob imports
    // This replaces the old schemas import with sdls
    // And also adds the directives import


    if (path.value.source.value === 'src/graphql/**/*.{js,ts}') {
      j(path).replaceWith([j.importDeclaration([j.importDefaultSpecifier(j.identifier('directives'))], j.literal('src/directives/**/*.{js,ts}')), j.importDeclaration([j.importDefaultSpecifier(j.identifier('sdls'))], j.literal('src/graphql/**/*.sdl.{js,ts}'))]);
    }
  }); // STEP 2: Remove makeMergedSchema, pass in directives, sdls and services

  (0, _forEach.default)(_context2 = (0, _find.default)(ast).call(ast, j.CallExpression, {
    callee: {
      name: 'createGraphQLHandler'
    }
  })).call(_context2, path => {
    var _context3;

    const schemaProp = (0, _find.default)(_context3 = j(path.node)).call(_context3, j.ObjectProperty, {
      key: {
        name: 'schema'
      }
    });
    schemaProp.replaceWith([j.identifier('directives'), j.identifier('sdls'), j.identifier('services')]);
  });
  return ast.toSource({
    trailingComma: true,
    quote: 'single'
  });
}