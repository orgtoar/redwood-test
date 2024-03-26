"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.concat = concat;
exports.concatUnique = concatUnique;
exports.interleave = interleave;
exports.isOpaque = isOpaque;
exports.keepExtension = exports.keepBothStatementParents = exports.keepBoth = exports.keepBase = void 0;
exports.opaquely = opaquely;
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));
var t = _interopRequireWildcard(require("@babel/types"));
var _lodash = _interopRequireDefault(require("lodash"));
var _algorithms = require("./algorithms");
const OPAQUE_UID_TAG = 'RW_MERGE_OPAQUE_UID_Q2xldmVyIHlvdSEgSGF2ZSBhIGNvb2tpZS4=';
function requireSameType(base, ext) {
  if (base.path.type !== ext.path.type) {
    throw new Error('Attempting to merge nodes with different types. This is not yet supported.');
  }
}
function requireStrategyExists(base, _ext, strategy, strategyName) {
  if (!(base.path.type in strategy)) {
    throw new Error(`Attempting to ${strategyName} nodes that do not have an ${strategyName} strategy.`);
  }
}
const strictEquality = (lhs, rhs) => lhs === rhs;
const byName = (lhs, rhs) => lhs.name === rhs.name;
const byKeyName = (lhs, rhs) => lhs.key.name === rhs.key.name;
const byValue = (lhs, rhs) => lhs.value === rhs.value;
function defaultEquality(baseContainer, extContainer) {
  const sample = baseContainer.length && baseContainer[0] || extContainer.length && extContainer[0];
  const defaults = {
    BigIntLiteral: byValue,
    BooleanLiteral: byValue,
    Identifier: byName,
    NumericLiteral: byValue,
    ObjectProperty: byKeyName,
    StringLiteral: byValue
  };
  return sample && sample.type in defaults ? defaults[sample.type] : strictEquality;
}
function opaquely(strategy) {
  strategy[OPAQUE_UID_TAG] = true;
  return strategy;
}
function isOpaque(strategy) {
  return strategy[OPAQUE_UID_TAG] === true;
}
const keepBase = exports.keepBase = opaquely(() => {});
const keepBoth = exports.keepBoth = opaquely((base, ext) => {
  base.path.insertAfter(ext.path.node);
});
const keepExtension = exports.keepExtension = opaquely((base, ext) => {
  base.path.replaceWith(ext.path);
});
const keepBothStatementParents = exports.keepBothStatementParents = opaquely((base, ext) => {
  // This creates an ambiguity. How do we treat nodes "between" base and its statement parent? Do we
  // recursively merge those, or not? In other words, are we opaque starting from base, or starting
  // from base.getStatementParent()? If it's the former, this currently works - the node reducer of
  // keepBothStatementParents marks the node as opaque. If it's the latter, this is wrong - again,
  // the node marked is opaque, but nodes which are children of base.getStatementParent(), but
  // parents of base will still be recursively merged by other strategies. I'm not sure what to do.
  base.path.getStatementParent().insertAfter(ext.path.getStatementParent().node);
});
const interleaveStrategy = {
  ImportDeclaration(baseImport, extImport) {
    const baseSpecs = baseImport.specifiers;
    const extSpecs = extImport.specifiers;
    const importSpecifierEquality = (lhs, rhs) => lhs.type === rhs.type && lhs.imported?.name === rhs.imported?.name && lhs.local?.name == rhs.local?.name;
    const uniqueSpecifiersOfType = type => {
      var _context;
      return _lodash.default.uniqWith((0, _filter.default)(_context = [...baseSpecs, ...extSpecs]).call(_context, (0, _algorithms.nodeIs)(type)), importSpecifierEquality);
    };

    // Rule 1: If there's exactly 1 import with 0 specifiers, it's a side-effect import and should
    // not be merged, because adding specifiers would change its meaning.
    if (!baseSpecs.length !== !extSpecs.length) {
      return keepBothStatementParents(baseImport, extImport);
    }

    // Rule 2: Default specifiers must appear first, and be unique in a statement.
    const defaultPosition = specs => (0, _some.default)(specs).call(specs, (0, _algorithms.nodeIs)('ImportDefaultSpecifier')) ? -1 : 0;

    // Rule 3: There can only be one wildcard import per statement, and wildcard imports cannot
    // mix with import specifiers.
    const namespacePosition = specs => (0, _some.default)(specs).call(specs, (0, _algorithms.nodeIs)('ImportNamespaceSpecifier')) || (0, _some.default)(specs).call(specs, (0, _algorithms.nodeIs)('ImportSpecifier')) ? -1 : specs.length;
    const importPosition = specs => (0, _some.default)(specs).call(specs, (0, _algorithms.nodeIs)('ImportNamespaceIdentifier')) ? -1 : specs.length;
    const [firstSpecifierList, ...rest] = (0, _algorithms.sieve)([uniqueSpecifiersOfType('ImportDefaultSpecifier'), defaultPosition], [uniqueSpecifiersOfType('ImportNamespaceSpecifier'), namespacePosition], [uniqueSpecifiersOfType('ImportSpecifier'), importPosition]);
    baseImport.specifiers = firstSpecifierList;
    if (rest.length) {
      baseImport.path.insertAfter((0, _map.default)(rest).call(rest, specs => t.importDeclaration(specs, baseImport.source)));
    }
  }
};
function interleave(base, ext) {
  requireSameType(base, ext);
  requireStrategyExists(base, ext, interleaveStrategy, 'interleave');
  return interleaveStrategy[base.path.type](base, ext);
}
const concatStrategy = {
  ArrayExpression(base, ext) {
    base.elements = [...base.elements, ...ext.elements];
  },
  ObjectExpression(base, ext) {
    base.properties = [...base.properties, ...ext.properties];
  },
  StringLiteral(base, ext) {
    var _context2;
    base.value = (0, _concat.default)(_context2 = base.value).call(_context2, ext.value);
  }
};
function concat(base, ext) {
  requireSameType(base, ext);
  requireStrategyExists(base, ext, concatStrategy, 'concat');
  return concatStrategy[base.path.type](base, ext);
}
const concatUniqueStrategy = {
  ArrayExpression(base, ext, eq) {
    eq ||= defaultEquality(base.elements, ext.elements);
    base.elements = _lodash.default.uniqWith([...base.elements, ...ext.elements], eq);
  },
  ObjectExpression(base, ext, eq) {
    eq ||= defaultEquality(base.properties, ext.properties);
    base.properties = _lodash.default.uniqWith([...base.properties, ...ext.properties], eq);
  }
};
function concatUnique(baseOrEq, ext) {
  // This function can be used directly as a node reducer, or to return a node reducer.
  // If it's used as a node reducer, it will receive two arguments like any other node reducer.
  //    1) the base to merge into
  //    2) the extension to merge into the base
  // If it's used to return a node reducer, it will receive one argument:
  //    1) the equality operator to use in the returned node reducer
  // So, we call the first argument baseOrEq to represent this duality.

  if (arguments.length === 1) {
    return (base, ext) => {
      requireSameType(base, ext);
      requireStrategyExists(base, ext, concatUniqueStrategy, 'concatUnique');
      return concatUniqueStrategy[base.path.type](base, ext, baseOrEq);
    };
  }
  if (arguments.length === 2) {
    requireSameType(baseOrEq, ext);
    requireStrategyExists(baseOrEq, ext, concatUniqueStrategy, 'concatUnique');
    // The type-specific concatUnique implementations will provide an appropriate equality operator.
    return concatUniqueStrategy[baseOrEq.path.type](baseOrEq, ext);
  }
}