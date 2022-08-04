"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = transform;

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

function renameTimestamp(j, optionsObject) {
  var _context;

  (0, _find.default)(_context = j(optionsObject)).call(_context, j.ObjectProperty, {
    key: {
      name: 'timestamp'
    }
  }).replaceWith(objectProperty => {
    const currentTimestampOverride = j.objectProperty.from({
      key: j.identifier('currentTimestampOverride'),
      value: objectProperty.value.value,
      // @ts-expect-error - trailingComments
      comments: objectProperty.value.trailingComments || null
    });
    return currentTimestampOverride;
  });
}

function transform(file, api) {
  var _context2;

  const j = api.jscodeshift;
  const ast = j(file.source);
  (0, _forEach.default)(_context2 = (0, _find.default)(ast).call(ast, j.CallExpression, callExpression => {
    const calleeName = callExpression.callee.name; // Find all calls to
    // `signPayload('timestampSchemeVerifier', ...)`
    // `verifyEvent('timestampSchemeVerifier', ...)`
    // `verifySignature('timestampSchemeVerifier', ...)`

    return (calleeName === 'signPayload' || calleeName === 'verifyEvent' || calleeName === 'verifySignature') && callExpression.arguments[0]?.type === 'StringLiteral' && callExpression.arguments[0]?.value === 'timestampSchemeVerifier';
  })).call(_context2, ({
    node: callExpression
  }) => {
    var _context3, _context4;

    (0, _forEach.default)(_context3 = (0, _find.default)(_context4 = j(callExpression) // Find all object properties called `options`
    ).call(_context4, j.ObjectProperty, {
      key: {
        name: 'options'
      }
    })).call(_context3, ({
      value: options
    }) => {
      // This codemod supports inline options object, like:
      //
      // verifyEvent('timestampSchemeVerifier', {
      //   event,
      //   options: {
      //     timestamp: Date.now() - 60 * 1000, // one minute ago
      //   },
      // })
      //
      // or when the options object is declared elsewhere, like:
      //
      // const verifierOptions = {
      //   timestamp: Date.now(),
      // }
      //
      // verifyEvent('timestampSchemeVerifier', {
      //   event,
      //   options: verifierOptions,
      // })
      if (j.ObjectExpression.check(options.value)) {
        // An inline options object is an ObjectExpression
        renameTimestamp(j, options.value);
      } else if (j.Identifier.check(options.value)) {
        var _context5;

        // An options object referenced by name is an Identifier.
        // Identifiers have a `name`
        (0, _forEach.default)(_context5 = ast.findVariableDeclarators(options.value.name)).call(_context5, n => {
          renameTimestamp(j, n.node);
        });
      }
    });
  });
  return ast.toSource({
    trailingComma: true,
    quote: 'single'
  });
}