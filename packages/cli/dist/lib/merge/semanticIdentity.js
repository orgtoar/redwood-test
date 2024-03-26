"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.semanticIdentity = semanticIdentity;
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
function semanticIdentity(path) {
  var _context;
  const identity = {
    get(path) {
      return path.type in this ? this[path.type](path) : [path.type];
    },
    ObjectProperty: path => [path.node.key.name],
    VariableDeclarator: path => [path.node.id.name],
    ImportDeclaration: path => ['ImportDeclaration', 'source', path.node.source.value]
  };
  return (0, _reduce.default)(_context = path.getAncestry()).call(_context, (acc, i) => [...identity.get(i), ...acc], []).join('.');
}