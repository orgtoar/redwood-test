"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = transform;

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

function transform(file, api) {
  const j = api.jscodeshift;
  const ast = j(file.source);
  const exportDeclarations = (0, _find.default)(ast).call(ast, j.ExportNamedDeclaration);

  const createStandardMockFunction = originalMockObject => {
    const newMockedObject = j.objectExpression(originalMockObject.value.properties);
    const returnStatement = j.returnStatement(newMockedObject); // creates the function aka factory, that returns the mock object

    return j.variableDeclarator( //@MARK cheating... not sure how to add const
    j.identifier('const standard'), j.arrowFunctionExpression([], j.blockStatement([returnStatement])));
  };

  (0, _forEach.default)(exportDeclarations).call(exportDeclarations, path => {
    var _context;

    const varDeclarations = (0, _find.default)(_context = j(path)).call(_context, j.VariableDeclaration);
    (0, _forEach.default)(varDeclarations).call(varDeclarations, declaration => {
      var _context2;

      const isStandardExport = (0, _find.default)(varDeclarations).call(varDeclarations, j.Identifier, {
        name: 'standard'
      }).paths().length > 0;

      if (!isStandardExport) {
        // exit early, ignore other exports
        return;
      }
      /* This is the actual object
      export const standard = 👉 { bazinga: true}
      **/


      const mockedObject = (0, _find.default)(_context2 = j(declaration)).call(_context2, j.ObjectExpression).paths()[0]; // If the mock is an object, change it to a function

      if (mockedObject) {
        // creates the function aka factory, that returns the mock object
        const mockFactory = createStandardMockFunction(mockedObject); // Replace the whole declaration, because I couldn't find an easy way to just change the init

        j(declaration).replaceWith(mockFactory);
      }
    });
  });
  return ast.toSource({
    trailingComma: true,
    quote: 'single'
  });
}