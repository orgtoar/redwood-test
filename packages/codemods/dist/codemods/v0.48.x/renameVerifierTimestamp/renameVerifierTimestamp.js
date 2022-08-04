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

function renameTimestamp(j, optionsObject) {
  j(optionsObject).find(j.ObjectProperty, {
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
  const j = api.jscodeshift;
  const ast = j(file.source);
  ast.find(j.CallExpression, callExpression => {
    var _callExpression$argum, _callExpression$argum2;

    const calleeName = callExpression.callee.name; // Find all calls to
    // `signPayload('timestampSchemeVerifier', ...)`
    // `verifyEvent('timestampSchemeVerifier', ...)`
    // `verifySignature('timestampSchemeVerifier', ...)`

    return (calleeName === 'signPayload' || calleeName === 'verifyEvent' || calleeName === 'verifySignature') && ((_callExpression$argum = callExpression.arguments[0]) === null || _callExpression$argum === void 0 ? void 0 : _callExpression$argum.type) === 'StringLiteral' && ((_callExpression$argum2 = callExpression.arguments[0]) === null || _callExpression$argum2 === void 0 ? void 0 : _callExpression$argum2.value) === 'timestampSchemeVerifier';
  }).forEach(({
    node: callExpression
  }) => {
    j(callExpression) // Find all object properties called `options`
    .find(j.ObjectProperty, {
      key: {
        name: 'options'
      }
    }).forEach(({
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
        // An options object referenced by name is an Identifier.
        // Identifiers have a `name`
        ast.findVariableDeclarators(options.value.name).forEach(n => {
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