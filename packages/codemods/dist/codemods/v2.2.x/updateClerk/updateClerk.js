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
  const ast = j(file.source);
  (0, _forEach.default)(_context = (0, _find.default)(ast).call(ast, j.ImportDeclaration, {
    source: {
      value: '@clerk/clerk-react'
    }
  })).call(_context, importDeclaration => {
    importDeclaration?.value.specifiers?.forEach(specifier => {
      if (j.ImportSpecifier.check(specifier) && specifier.imported.name === 'withClerk') {
        // Found `withClerk` import. Now I want to replace that with a
        // `ClerkLoaded` import instead
        specifier.imported.name = 'ClerkLoaded'; // And finally, for the imports, we need to add a new import to give us `navigate`

        j(importDeclaration).insertAfter("import { navigate } from '@redwoodjs/router'");
      }
    });
  });
  let comments = []; // Remove old RW Clerk components

  (0, _forEach.default)(_context2 = (0, _find.default)(ast).call(ast, j.VariableDeclaration)).call(_context2, variableDeclaration => {
    var _context3;

    if ((0, _find.default)(_context3 = variableDeclaration.value.declarations).call(_context3, declaration => {
      return j.VariableDeclarator.check(declaration) && j.Identifier.check(declaration.id) && (declaration.id.name === 'ClerkAuthProvider' || declaration.id.name === 'ClerkAuthConsumer');
    })) {
      comments = [...comments, ...(variableDeclaration.value.comments || [])];
      j(variableDeclaration).remove();
    }
  });
  const appVariableDeclaration = (0, _find.default)(ast).call(ast, j.VariableDeclaration, {
    declarations: [{
      id: {
        name: 'App'
      }
    }]
  });
  const clerkAuthProvider = j.variableDeclaration('const', [j.variableDeclarator(j.identifier('ClerkAuthProvider'), j.arrowFunctionExpression([j.identifier('({ children })')], j.jsxExpressionContainer(j.identifier(`
  const frontendApi = process.env.CLERK_FRONTEND_API_URL
  if (!frontendApi) {
    throw new Error('Need to define env variable CLERK_FRONTEND_API_URL')
  }

  return (
    <ClerkProvider frontendApi={frontendApi} navigate={(to) => navigate(to)}>
      <ClerkLoaded>
        {children}
      </ClerkLoaded>
    </ClerkProvider>
  )
`))))]);
  clerkAuthProvider.comments = comments;
  appVariableDeclaration.insertBefore([clerkAuthProvider]);
  return ast.toSource();
}