"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transform;
require("core-js/modules/es.array.push.js");
var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _at = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/at"));
function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const allImports = (0, _find.default)(root).call(root, j.ImportDeclaration);
  const hasStoreImport = (0, _some.default)(allImports).call(allImports, i => {
    return i.get('source').value.value === 'src/lib/trustedDocumentsStore';
  });
  if (!hasStoreImport) {
    (0, _at.default)(allImports).call(allImports, -1).insertAfter(j.importDeclaration([j.importSpecifier(j.identifier('store'))], j.literal('src/lib/trustedDocumentsStore')));
  }
  const createGraphQLHandlerCalls = (0, _find.default)(root).call(root, j.CallExpression, {
    callee: {
      name: 'createGraphQLHandler'
    }
  });
  if (createGraphQLHandlerCalls.length === 0) {
    throw new Error("Error updating your graphql handler function. You'll have to do it manually. " + "(Couldn't find a call to `createGraphQLHandler`)");
  }
  const existingTrustedDocumentsProperty = (0, _find.default)(createGraphQLHandlerCalls).call(createGraphQLHandlerCalls, j.ObjectProperty, {
    key: {
      name: 'trustedDocuments'
    }
  });
  if (existingTrustedDocumentsProperty.length === 0) {
    const storeProperty = j.objectProperty(j.identifier('store'), j.identifier('store'));
    storeProperty.shorthand = true;
    createGraphQLHandlerCalls.get(0).node.arguments[0].properties.push(j.objectProperty(j.identifier('trustedDocuments'), j.objectExpression([storeProperty])));
  }
  return root.toSource();
}