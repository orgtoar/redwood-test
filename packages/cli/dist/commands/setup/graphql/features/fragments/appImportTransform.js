"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transform;
var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _at = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/at"));
function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const possibleTypesImports = (0, _find.default)(root).call(root, j.ImportDeclaration);
  const hasPossibleTypesImport = (0, _some.default)(possibleTypesImports).call(possibleTypesImports, i => {
    return i.get('source').value.value === 'src/graphql/possibleTypes' || i.get('source').value.value === './graphql/possibleTypes';
  });
  if (!hasPossibleTypesImport) {
    (0, _at.default)(possibleTypesImports).call(possibleTypesImports, 1).insertAfter(j.importDeclaration([j.importDefaultSpecifier(j.identifier('possibleTypes'))], j.literal('src/graphql/possibleTypes')));
  }
  return root.toSource();
}