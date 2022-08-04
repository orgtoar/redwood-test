"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transform;

function transform(file, api) {
  const j = api.jscodeshift;
  const ast = j(file.source);
  ast.find(j.AssignmentExpression).forEach(path => {
    const lhs = path.value.left;
    const rhs = path.value.right;

    if (lhs && rhs.type === 'Identifier' && rhs.name === 'config') {
      j(path).replaceWith(j.expressionStatement(j.assignmentExpression('=', j.identifier('module.exports'), j.identifier('{ config }'))));
    }
  });
  return ast.toSource();
}