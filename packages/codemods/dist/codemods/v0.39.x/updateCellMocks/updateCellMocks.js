"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transform;

require("core-js/modules/esnext.async-iterator.find.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.find.js");

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.for-each.js");

function transform(file, api) {
  const j = api.jscodeshift;
  const ast = j(file.source);
  const exportDeclarations = ast.find(j.ExportNamedDeclaration);

  const createStandardMockFunction = originalMockObject => {
    const newMockedObject = j.objectExpression(originalMockObject.value.properties);
    const returnStatement = j.returnStatement(newMockedObject); // creates the function aka factory, that returns the mock object

    return j.variableDeclarator( //@MARK cheating... not sure how to add const
    j.identifier('const standard'), j.arrowFunctionExpression([], j.blockStatement([returnStatement])));
  };

  exportDeclarations.forEach(path => {
    const varDeclarations = j(path).find(j.VariableDeclaration);
    varDeclarations.forEach(declaration => {
      const isStandardExport = varDeclarations.find(j.Identifier, {
        name: 'standard'
      }).paths().length > 0;

      if (!isStandardExport) {
        // exit early, ignore other exports
        return;
      }
      /* This is the actual object
      export const standard = 👉 { bazinga: true}
      **/


      const mockedObject = j(declaration).find(j.ObjectExpression).paths()[0]; // If the mock is an object, change it to a function

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