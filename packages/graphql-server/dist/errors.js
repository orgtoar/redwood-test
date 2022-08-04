"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValidationError = exports.UserInputError = exports.SyntaxError = exports.RedwoodGraphQLError = exports.PersistedQueryNotSupportedError = exports.PersistedQueryNotFoundError = exports.ForbiddenError = exports.AuthenticationError = void 0;

var _common = require("@graphql-yoga/common");

// based on ApolloError https://github.com/apollographql/apollo-server/blob/main/packages/apollo-server-errors/src/index.ts
class RedwoodGraphQLError extends _common.GraphQLYogaError {
  constructor(message, extensions) {
    super(message, extensions);
  }

}

exports.RedwoodGraphQLError = RedwoodGraphQLError;

class SyntaxError extends RedwoodGraphQLError {
  constructor(message) {
    super(message, {
      code: 'GRAPHQL_PARSE_FAILED'
    });
  }

}

exports.SyntaxError = SyntaxError;

class ValidationError extends RedwoodGraphQLError {
  constructor(message) {
    super(message, {
      code: 'GRAPHQL_VALIDATION_FAILED'
    });
  }

}

exports.ValidationError = ValidationError;

class AuthenticationError extends RedwoodGraphQLError {
  constructor(message) {
    super(message, {
      code: 'UNAUTHENTICATED'
    });
  }

}

exports.AuthenticationError = AuthenticationError;

class ForbiddenError extends RedwoodGraphQLError {
  constructor(message) {
    super(message, {
      code: 'FORBIDDEN'
    });
  }

}

exports.ForbiddenError = ForbiddenError;

class PersistedQueryNotFoundError extends RedwoodGraphQLError {
  constructor() {
    super('PersistedQueryNotFound', {
      code: 'PERSISTED_QUERY_NOT_FOUND'
    });
  }

}

exports.PersistedQueryNotFoundError = PersistedQueryNotFoundError;

class PersistedQueryNotSupportedError extends RedwoodGraphQLError {
  constructor() {
    super('PersistedQueryNotSupported', {
      code: 'PERSISTED_QUERY_NOT_SUPPORTED'
    });
  }

}

exports.PersistedQueryNotSupportedError = PersistedQueryNotSupportedError;

class UserInputError extends RedwoodGraphQLError {
  constructor(message, properties) {
    super(message, {
      code: 'BAD_USER_INPUT',
      properties
    });
  }

}

exports.UserInputError = UserInputError;