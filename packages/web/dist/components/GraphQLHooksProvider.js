"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphQLHooksProvider = exports.GraphQLHooksContext = void 0;
exports.useMutation = useMutation;
exports.useQuery = useQuery;

var _react = _interopRequireDefault(require("react"));

const GraphQLHooksContext = _react.default.createContext({
  useQuery: () => {
    throw new Error('You must register a useQuery hook via the `GraphQLHooksProvider`');
  },
  useMutation: () => {
    throw new Error('You must register a useMutation hook via the `GraphQLHooksProvider`');
  }
});

exports.GraphQLHooksContext = GraphQLHooksContext;

/**
 * GraphQLHooksProvider stores standard `useQuery` and `useMutation` hooks for Redwood
 * that can be mapped to your GraphQL library of choice's own `useQuery`
 * and `useMutation` implementation.
 *
 * @todo Let the user pass in the additional type for options.
 */
const GraphQLHooksProvider = _ref => {
  let {
    useQuery,
    useMutation,
    children
  } = _ref;
  return /*#__PURE__*/_react.default.createElement(GraphQLHooksContext.Provider, {
    value: {
      useQuery,
      useMutation
    }
  }, children);
};

exports.GraphQLHooksProvider = GraphQLHooksProvider;

function useQuery(query, options) {
  return _react.default.useContext(GraphQLHooksContext).useQuery(query, options);
}

function useMutation(mutation, options) {
  return _react.default.useContext(GraphQLHooksContext).useMutation(mutation, options);
}