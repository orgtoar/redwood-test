"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RedwoodApolloProvider = void 0;

var _react = _interopRequireDefault(require("react"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var apolloClient = _interopRequireWildcard(require("@apollo/client"));

var _context2 = require("@apollo/client/link/context");

var _printer = require("graphql/language/printer");

var _auth = require("@redwoodjs/auth");

require("./typeOverride");

var _FetchConfigProvider = require("../components/FetchConfigProvider");

var _GraphQLHooksProvider = require("../components/GraphQLHooksProvider");

// Note: Importing directly from `apollo/client` does not work properly in Storybook.
const {
  ApolloProvider,
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  useQuery,
  useMutation,
  setLogVerbosity: apolloSetLogVerbosity
} = apolloClient;

const ApolloProviderWithFetchConfig = _ref => {
  let {
    config,
    children,
    useAuth,
    logLevel
  } = _ref;

  /**
   * Should they run into it,
   * this helps users with the "Cannot render cell; GraphQL success but data is null" error.
   *
   * @see {@link https://github.com/redwoodjs/redwood/issues/2473}
   */
  apolloSetLogVerbosity(logLevel);
  /**
   * Here we're using Apollo Link to customize Apollo Client's data flow.
   *
   * Although we're sending conventional HTTP-based requests and could just pass `uri` instead of `link`,
   * we need to fetch a new token on every request, making middleware a good fit for this.
   *
   * @see {@link https://www.apollographql.com/docs/react/api/link/introduction/}
   */

  const {
    getToken,
    type: authProviderType
  } = useAuth(); // updateDataApolloLink keeps track of the most recent req/res data so they can be passed into
  // any errors passed up to a error boundary.

  const data = {
    mostRecentRequest: undefined,
    mostRecentResponse: undefined
  };
  const updateDataApolloLink = new ApolloLink((operation, forward) => {
    var _context;

    const {
      operationName,
      query,
      variables
    } = operation;
    data.mostRecentRequest = {};
    data.mostRecentRequest.operationName = operationName;
    data.mostRecentRequest.operationKind = query === null || query === void 0 ? void 0 : query.kind.toString();
    data.mostRecentRequest.variables = variables;
    data.mostRecentRequest.query = query && (0, _printer.print)(operation.query);
    return (0, _map.default)(_context = forward(operation)).call(_context, result => {
      data.mostRecentResponse = result;
      return result;
    });
  });
  const withToken = (0, _context2.setContext)(async () => {
    const token = await getToken();
    return {
      token
    };
  });
  const {
    headers,
    uri
  } = (0, _FetchConfigProvider.useFetchConfig)();
  const authMiddleware = new ApolloLink((operation, forward) => {
    const {
      token
    } = operation.getContext(); // Only add auth headers when token is present
    // Token is null, when !isAuthenticated

    const authHeaders = token ? {
      'auth-provider': authProviderType,
      authorization: "Bearer ".concat(token)
    } : {};
    operation.setContext(() => ({
      headers: { ...headers,
        // Duped auth headers, because we may remove FetchContext at a later date
        ...authHeaders
      }
    }));
    return forward(operation);
  });
  /**
   * A terminating link.
   * Apollo Client uses this to send GraphQL operations to a server over HTTP.
   *
   * @see {@link https://www.apollographql.com/docs/react/api/link/introduction/#the-terminating-link}
   */

  const {
    httpLinkConfig,
    link: userLink,
    ...rest
  } = config !== null && config !== void 0 ? config : {};
  const httpLink = new HttpLink({
    uri,
    ...httpLinkConfig
  });
  /**
   * The order here is important. The last link *must* be a terminating link like HttpLink.
   */

  const rwLinks = [withToken, authMiddleware, updateDataApolloLink, httpLink];
  /**
   * If the user provides a link that's a function,
   * we want to call it with our link.
   *
   * If it's not, we just want to use it.
   *
   * And if they don't provide it, we just want to use ours.
   */

  let link = ApolloLink.from(rwLinks);

  if (userLink) {
    link = typeof userLink === 'function' ? userLink(rwLinks) : userLink;
  }

  const client = new ApolloClient({
    /**
     * Default options for every Cell.
     * Better to specify them here than in `beforeQuery`
     * where it's too easy to overwrite them.
     *
     * @see {@link https://www.apollographql.com/docs/react/api/core/ApolloClient/#example-defaultoptions-object}
     */
    defaultOptions: {
      watchQuery: {
        /**
         * The `fetchPolicy` we expect:
         *
         * > Apollo Client executes the full query against both the cache and your GraphQL server.
         * > The query automatically updates if the result of the server-side query modifies cached fields.
         *
         * @see {@link https://www.apollographql.com/docs/react/data/queries/#cache-and-network}
         */
        fetchPolicy: 'cache-and-network',

        /**
         * So that Cells rerender when refetching: {@link https://www.apollographql.com/docs/react/data/queries/#inspecting-loading-states}
         */
        notifyOnNetworkStatusChange: true
      }
    },
    link,
    ...rest
  });

  const extendErrorAndRethrow = (error, _errorInfo) => {
    error['mostRecentRequest'] = data.mostRecentRequest;
    error['mostRecentResponse'] = data.mostRecentResponse;
    throw error;
  };

  return /*#__PURE__*/_react.default.createElement(ApolloProvider, {
    client: client
  }, /*#__PURE__*/_react.default.createElement(ErrorBoundary, {
    onError: extendErrorAndRethrow
  }, children));
};

class ErrorBoundary extends _react.default.Component {
  componentDidCatch() {
    this.setState({});
    this.props.onError(...arguments);
  }

  render() {
    return this.props.children;
  }

}

const RedwoodApolloProvider = _ref2 => {
  let {
    graphQLClientConfig,
    useAuth = _auth.useAuth,
    logLevel = 'debug',
    children
  } = _ref2;

  /**
   * Since Apollo Client gets re-instantiated on auth changes,
   * we have to instantiate `InMemoryCache` here,
   * so that it doesn't get wiped.
   */
  const {
    cacheConfig,
    ...config
  } = graphQLClientConfig !== null && graphQLClientConfig !== void 0 ? graphQLClientConfig : {};
  const cache = new InMemoryCache(cacheConfig);
  return /*#__PURE__*/_react.default.createElement(_FetchConfigProvider.FetchConfigProvider, {
    useAuth: useAuth
  }, /*#__PURE__*/_react.default.createElement(ApolloProviderWithFetchConfig
  /**
   * This order so that the user can still completely overwrite the cache.
   */
  , {
    config: {
      cache,
      ...config
    },
    useAuth: useAuth,
    logLevel: logLevel
  }, /*#__PURE__*/_react.default.createElement(_GraphQLHooksProvider.GraphQLHooksProvider, {
    useQuery: useQuery,
    useMutation: useMutation
  }, children)));
};

exports.RedwoodApolloProvider = RedwoodApolloProvider;