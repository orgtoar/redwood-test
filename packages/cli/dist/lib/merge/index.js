"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.merge = merge;
require("core-js/modules/es.array.push.js");
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _findIndex = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find-index"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _core = require("@babel/core");
var _generator = _interopRequireDefault(require("@babel/generator"));
var _types = require("@babel/types");
var _lodash = require("lodash");
var _prettier = _interopRequireDefault(require("prettier"));
var _algorithms = require("./algorithms");
var _semanticIdentity = require("./semanticIdentity");
var _strategy = require("./strategy");
function extractProperty(property, fromObject) {
  if (property === undefined) {
    return undefined;
  }
  const tmp = fromObject[property];
  delete fromObject[property];
  return tmp;
}

// This feels like a weird way to achieve something so simple in Babel, but I can't find a better
// alternative.
function getProgramPath(ast) {
  let programPath;
  (0, _core.traverse)(ast, {
    Program(path) {
      programPath = path;
      return;
    }
  });
  if (programPath === undefined) {
    throw new Error('Unable to find Program node in AST');
  }
  return programPath;
}

// See https://github.com/babel/babel/issues/14480
function skipChildren(path) {
  for (const key of _types.VISITOR_KEYS[path.type]) {
    path.skipKey(key);
  }
}

/**
 * We can make merge strategies more terse and intuitive if we pass a Babel Node, rather than a
 * NodePath, to the reducer. This would allow us to write:
 *
 * ArrayExpression: (lhs, rhs) => { lhs.elements.push(...rhs.elements) }
 * instead of
 * ArrayExpression: (lhs, rhs) => { lhs.node.elements.push(...rhs.node.elements) }
 *
 * It may seem like a small difference, but the code is much more intuitive if you don't have to
 * think about Babel nodes vs paths when writing reducers.
 *
 * We could just pass the node directly to the reducer, but there are reasonable (though rare) cases
 * where you do want access to the NodePath. To solve this, we create a proxy object that appears as
 * a Babel Node with an additional `path` property that points back to the NodePath.
 */
function makeProxy(path) {
  return new Proxy(path, {
    get(target, property) {
      if (property === 'path') {
        return target;
      } else {
        return target.node[property];
      }
    },
    set(target, property, value) {
      if (property === 'path') {
        throw new Error("You can't set a path on a proxy!");
      } else {
        target.node[property] = value;
        return true;
      }
    },
    has(target, property) {
      return property in target.node;
    }
  });
}
function expressionUses(exp, ...ids) {
  let result = false;
  exp.traverse({
    Identifier(path) {
      if (!path.parentPath.isNodeType('VariableDeclarator') && (0, _includes.default)(ids).call(ids, path.node.name)) {
        result = true;
        return;
      }
    }
  });
  return result;
}

// Insert the given expression before the first usage of its name in 'path', or at the end of the
// program body if no such usage exists.
function insertBeforeFirstUsage(expression, program) {
  const body = program.get('body');
  const pos = (0, _findIndex.default)(body).call(body, exp => expressionUses(exp, ...(0, _keys.default)(expression.getBindingIdentifiers())));
  return pos !== -1 ? body[pos].insertBefore(expression.node) : program.pushContainer('body', expression.node);
}
function insertAfterLastImport(expression, program) {
  const body = program.get('body');
  return body[body.findLastIndex(bodyExpr => bodyExpr.isNodeType('ImportDeclaration'))].insertAfter(expression.node);
}
function prune(path) {
  switch (path.parentPath.type) {
    // If pruning 'path' would yield an ill-formed parent (e.g, '{foo:}' or 'const x;'), prune it.
    case 'ObjectProperty':
    case 'VariableDeclarator':
      return path.parentPath.remove();
    default:
      console.log(`Warning: default prune strategy for ${path.parentPath.type}`);
    // eslint-disable-next-line no-fallthrough
    case 'Program':
    case 'ArrayExpression':
      return path.remove();
  }
}

// When merging, trailing comments are a bit nasty. A comment can be parsed as a leading comment
// of one expression, and a trailing comment of a subsequent expression. This is sort of an open
// issue for Babel: https://github.com/babel/babel/issues/7002, but we can work around it pretty
// easily with the following:
function stripTrailingCommentsStrategy() {
  return {
    enter(path) {
      path.node.trailingComments = [];
    }
  };
}

/**
 * The node types specified in the strategy are copied from extAST into baseAST.
 *
 * @param { import("@babel/core").ParseResult } baseAST
 * @param { import("@babel/core").ParseResult } extAST
 * @param { Object } strategy
 *
 * 1. Traverse extAST and track the semantic IDs of all of the nodes for which we have a merge
 *    strategy.
 * 2. Traverse baseAST. On node exit, attempt to merge semantically-equivalent ext nodes.
 *     a. When a semantically equivalent ext node is merged, it is pruned from ext.
 * 3. Traverse extAST's body (if any nodes remain) and attempt to put top-level declarations at
 *    their latest-possible positions.
 *     a. Latest-possible is defined as the position immediately preceeding the first use of the
 *     node's binding, if it exists.
 */
function mergeAST(baseAST, extAST, strategy = {}) {
  const identity = extractProperty('identity', strategy) ?? _semanticIdentity.semanticIdentity;
  const identities = {};
  const baseVisitor = {
    ...stripTrailingCommentsStrategy()
  };
  const extVisitor = {
    ...stripTrailingCommentsStrategy()
  };
  (0, _algorithms.forEachFunctionOn)(strategy, (typename, strat) => {
    extVisitor[typename] = {
      enter(path) {
        const id = identity(path);
        id && (identities[id] ||= []).push(path);
      }
    };
    baseVisitor[typename] = {
      enter(path) {
        if ((0, _strategy.isOpaque)(strat)) {
          skipChildren(path);
        }
      },
      exit(path) {
        const exts = extractProperty(identity(path), identities);
        if (exts) {
          var _context;
          const proxyPath = makeProxy(path);
          (0, _forEach.default)(_context = (0, _map.default)(exts).call(exts, makeProxy)).call(_context, ext => {
            strat(proxyPath, ext);
            prune(ext.path);
          });
        }
      }
    };
  });
  (0, _core.traverse)(extAST, extVisitor);
  (0, _core.traverse)(baseAST, baseVisitor);
  const baseProgram = getProgramPath(baseAST);
  const [imports, others] = (0, _lodash.partition)(getProgramPath(extAST).get('body'), (0, _algorithms.nodeIs)('ImportDeclaration'));
  (0, _forEach.default)(imports).call(imports, exp => insertAfterLastImport(exp, baseProgram));
  (0, _lodash.forEachRight)(others, exp => insertBeforeFirstUsage(exp, baseProgram));
}

/**
 * Copy specified AST nodes from extension into base. Use reducer functions specified in strategy to
 * recursively merge from leaf to root.
 * @param {string} base - a string of JavaScript code. Must be well-formed.
 * @param {string} extension - a string of JavaScript code. May refer to bindings only defined in base.
 * @param {Object} strategy - Mapping of AST node name to reducer functions.
 * @returns
 */
function merge(base, extension, strategy) {
  function parseReact(code) {
    return (0, _core.parse)(code, {
      filename: 'merged.tsx',
      // required to prevent babel error. The .tsx is relevant
      presets: ['@babel/preset-typescript']
    });
  }
  const baseAST = parseReact(base);
  const extAST = parseReact(extension);
  mergeAST(baseAST, extAST, strategy);
  const {
    code
  } = (0, _generator.default)(baseAST);

  // When testing, use prettier here to produce predictable outputs.
  // Otherwise, leave formatting to the caller.
  return process.env.VITEST_POOL_ID ? _prettier.default.format(code, {
    parser: 'babel-ts',
    bracketSpacing: true,
    tabWidth: 2,
    semi: false,
    singleQuote: true
  }) : code;
}