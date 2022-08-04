"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.testValidationErrorQuery = exports.testSchema = exports.testQuery = exports.testParseErrorQuery = exports.testFilteredQuery = exports.testErrorQuery = void 0;

var _schema = require("@graphql-tools/schema");

const testSchema = (0, _schema.makeExecutableSchema)({
  typeDefs:
  /* GraphQL */
  `
    type Query {
      me: User!
    }

    type Query {
      forbiddenUser: User!
      getUser(id: Int!): User!
    }

    type User {
      id: ID!
      name: String!
    }
  `,
  resolvers: {
    Query: {
      me: () => {
        return {
          _id: 1,
          firstName: 'Ba',
          lastName: 'Zinga'
        };
      },
      forbiddenUser: () => {
        throw Error('You are forbidden');
      },
      getUser: id => {
        return {
          id,
          firstName: 'Ba',
          lastName: 'Zinga'
        };
      }
    },
    User: {
      id: u => u._id,
      name: u => `${u.firstName} ${u.lastName}`
    }
  }
});
exports.testSchema = testSchema;
const testQuery =
/* GraphQL */
`
  query meQuery {
    me {
      id
      name
    }
  }
`;
exports.testQuery = testQuery;
const testFilteredQuery =
/* GraphQL */
`
  query FilteredQuery {
    me {
      id
      name
    }
  }
`;
exports.testFilteredQuery = testFilteredQuery;
const testErrorQuery =
/* GraphQL */
`
  query forbiddenUserQuery {
    forbiddenUser {
      id
      name
    }
  }
`;
exports.testErrorQuery = testErrorQuery;
const testParseErrorQuery =
/* GraphQL */
`
  query ParseErrorQuery {
    me {
      id
      name
      unknown_field
    }
  }
`;
exports.testParseErrorQuery = testParseErrorQuery;
const testValidationErrorQuery =
/* GraphQL */
`
  query ValidationErrorQuery(id: Int!) {
    getUser(id: 'one') {
      id
      name
    }
  }
`;
exports.testValidationErrorQuery = testValidationErrorQuery;