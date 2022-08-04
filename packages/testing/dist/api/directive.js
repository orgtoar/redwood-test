"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

_Object$defineProperty(exports, "getDirectiveName", {
  enumerable: true,
  get: function () {
    return _graphqlServer.getDirectiveName;
  }
});

exports.mockRedwoodDirective = void 0;

var _graphqlServer = require("@redwoodjs/graphql-server");

/**
 * @description
 *
 * Used for writing both synchronous and asynchronous directive tests e.g.
 *
 * - Transformer directives can be passed mockedResolvedValue
 * - Validator directives should check for errors thrown in certain situations
 *
 * @example
 *
 * Synchronous transformer directive:
 *
 * ```ts
 * const mockExecution = mockRedwoodDirective(myTransformer, {
 *   context: currentUser,
 *   mockedResolvedValue: 'Original Value',
 * })
 *
 * expect(mockExecution).not.toThrow()
 * expect(mockExecution()).toEqual('Transformed Value')
 * ```ts
 *
 * @example
 *
 * Asynchronous transformer directive:
 *
 * ```ts
 * const mockExecution = mockRedwoodDirective(myTransformer, {
 *   context: currentUser,
 *   mockedResolvedValue: 'Original Value',
 * })
 *
 * await expect(mockExecution).resolves.not.toThrow()
 * await expect(mockExecution()).resolves.toEqual('Transformed Value')
 * ```
 */
const mockRedwoodDirective = (directive, executionMock) => {
  const {
    directiveArgs = {},
    context,
    ...others
  } = executionMock;

  if (context) {
    (0, _graphqlServer.setContext)(context || {});
  }

  if (directive.onResolverCalled.constructor.name === 'AsyncFunction') {
    return async () => {
      if (directive.type === _graphqlServer.DirectiveType.TRANSFORMER) {
        const {
          mockedResolvedValue
        } = others;
        return directive.onResolverCalled({
          resolvedValue: mockedResolvedValue,
          context: _graphqlServer.context,
          ...others
        });
      } else {
        await directive.onResolverCalled({
          context: _graphqlServer.context,
          directiveArgs,
          ...others
        });
      }
    };
  }

  return () => {
    if (directive.type === _graphqlServer.DirectiveType.TRANSFORMER) {
      const {
        mockedResolvedValue
      } = others;
      return directive.onResolverCalled({
        resolvedValue: mockedResolvedValue,
        context: _graphqlServer.context,
        directiveArgs,
        ...others
      });
    } else {
      directive.onResolverCalled({
        context: _graphqlServer.context,
        directiveArgs,
        ...others
      });
    }
  };
};

exports.mockRedwoodDirective = mockRedwoodDirective;