"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.schema = exports.resolvers = void 0;

var _graphqlScalars = require("graphql-scalars");

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @TODO move prismaVersion & redwoodVersion to internal?
// We don't want a circular dependency here..
const {
  prismaVersion,
  redwoodVersion
} = require('@redwoodjs/api'); // We duplicate this here, because we don't want circular dependency with graphql-server
// This type doesn't have any real impact outside this file


/**
 * This adds scalar types for dealing with Date, Time, DateTime, and JSON.
 * This also adds a root Query type which is needed to start the GraphQL server on a fresh install.
 *
 * NOTE: When you add a new Scalar type you must add it to
 * "generateTypeDefGraphQL" in @redwoodjs/internal.
 */
const schema = (0, _graphqlTag.default)`
  scalar BigInt
  scalar Date
  scalar Time
  scalar DateTime
  scalar JSON
  scalar JSONObject

  type Redwood {
    version: String
    currentUser: JSON
    prismaVersion: String
  }

  type Query {
    redwood: Redwood
  }
`;
exports.schema = schema;
const resolvers = {
  BigInt: _graphqlScalars.BigIntResolver,
  Date: _graphqlScalars.DateResolver,
  Time: _graphqlScalars.TimeResolver,
  DateTime: _graphqlScalars.DateTimeResolver,
  JSON: _graphqlScalars.JSONResolver,
  JSONObject: _graphqlScalars.JSONObjectResolver,
  Query: {
    redwood: () => ({
      version: redwoodVersion,
      prismaVersion: prismaVersion,
      currentUser: (_args, context) => {
        return context === null || context === void 0 ? void 0 : context.currentUser;
      }
    })
  }
};
exports.resolvers = resolvers;