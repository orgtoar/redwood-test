"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCell = createCell;

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _graphql = require("../graphql");

var _CellCacheContext = require("./CellCacheContext");

var _GraphQLHooksProvider = require("./GraphQLHooksProvider");

/**
 * This is part of how we let users swap out their GraphQL client while staying compatible with Cells.
 */

/**
 * The default `isEmpty` implementation. Checks if the first field is `null` or an empty array.
 *
 * @remarks
 *
 * Consider the following queries. The former returns an object, the latter a list:
 *
 * ```js
 * export const QUERY = gql`
 *   post {
 *     title
 *   }
 * `
 *
 * export const QUERY = gql`
 *   posts {
 *     title
 *   }
 * `
 * ```
 *
 * If either are "empty", they return:
 *
 * ```js
 * {
 *   data: {
 *     post: null
 *   }
 * }
 *
 * {
 *   data: {
 *     posts: []
 *   }
 * }
 * ```
 *
 * Note that the latter can return `null` as well depending on the SDL (`posts: [Post!]`).
 *
 * @remarks
 *
 * We only check the first field (in the example below, `users`):
 *
 * ```js
 * export const QUERY = gql`
 *   users {
 *     name
 *   }
 *   posts {
 *     title
 *   }
 * `
 * ```
 */
const dataField = data => {
  return data[Object.keys(data)[0]];
};

const isDataNull = data => {
  return dataField(data) === null;
};

const isDataEmptyArray = data => {
  const field = dataField(data);
  return Array.isArray(field) && field.length === 0;
};

const isDataEmpty = data => {
  return isDataNull(data) || isDataEmptyArray(data);
};
/**
 * Creates a Cell out of a GraphQL query and components that track to its lifecycle.
 */


function createCell(_ref) {
  let {
    QUERY,
    beforeQuery = props => ({
      variables: props,

      /**
       * We're duplicating these props here due to a suspected bug in Apollo Client v3.5.4
       * (it doesn't seem to be respecting `defaultOptions` in `RedwoodApolloProvider`.)
       *
       * @see {@link https://github.com/apollographql/apollo-client/issues/9105}
       */
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true
    }),
    afterQuery = data => ({ ...data
    }),
    isEmpty = isDataEmpty,
    Loading = () => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, "Loading..."),
    Failure,
    Empty,
    Success,
    displayName = 'Cell'
  } = _ref;

  function NamedCell(props) {
    /**
     * Right now, Cells don't render `children`.
     */
    const {
      children: _,
      ...variables
    } = props;
    const options = beforeQuery(variables);
    const query = typeof QUERY === 'function' ? QUERY(options) : QUERY; // queryRest includes `variables: { ... }`, with any variables returned
    // from beforeQuery
    // eslint-disable-next-line prefer-const

    let {
      error,
      loading,
      data,
      ...queryRest
    } = (0, _GraphQLHooksProvider.useQuery)(query, options);

    if (global.__REDWOOD__PRERENDERING) {
      // __REDWOOD__PRERENDERING will always either be set, or not set. So
      // rules-of-hooks are still respected, even though we wrap this in an if
      // statement

      /* eslint-disable-next-line react-hooks/rules-of-hooks */
      const {
        queryCache
      } = (0, _CellCacheContext.useCellCacheContext)();
      const operationName = (0, _graphql.getOperationName)(query);
      let cacheKey;

      if (operationName) {
        cacheKey = operationName + '_' + JSON.stringify(variables);
      } else {
        const cellName = displayName === 'Cell' ? 'the cell' : displayName;
        throw new Error("The gql query in ".concat(cellName, " is missing an operation name. ") + 'Something like FindBlogPostQuery in ' + '`query FindBlogPostQuery($id: Int!)`');
      }

      const queryInfo = queryCache[cacheKey];

      if (queryInfo !== null && queryInfo !== void 0 && queryInfo.hasFetched) {
        loading = false;
        data = queryInfo.data; // All of the gql client's props aren't available when pre-rendering,
        // so using `any` here

        queryRest = {
          variables
        };
      } else {
        var _cacheKey;

        queryCache[_cacheKey = cacheKey] || (queryCache[_cacheKey] = {
          query,
          variables: options.variables,
          hasFetched: false
        });
      }
    }

    if (error) {
      if (Failure) {
        var _error$graphQLErrors, _error$graphQLErrors$, _error$graphQLErrors$2;

        return /*#__PURE__*/_react.default.createElement(Failure, (0, _extends2.default)({
          error: error,
          errorCode: (_error$graphQLErrors = error.graphQLErrors) === null || _error$graphQLErrors === void 0 ? void 0 : (_error$graphQLErrors$ = _error$graphQLErrors[0]) === null || _error$graphQLErrors$ === void 0 ? void 0 : (_error$graphQLErrors$2 = _error$graphQLErrors$.extensions) === null || _error$graphQLErrors$2 === void 0 ? void 0 : _error$graphQLErrors$2['code']
        }, props, {
          updating: loading
        }, queryRest));
      } else {
        throw error;
      }
    } else if (data) {
      const afterQueryData = afterQuery(data);

      if (isEmpty(data, {
        isDataEmpty
      }) && Empty) {
        return /*#__PURE__*/_react.default.createElement(Empty, (0, _extends2.default)({}, props, afterQueryData, {
          updating: loading
        }, queryRest));
      } else {
        return /*#__PURE__*/_react.default.createElement(Success, (0, _extends2.default)({}, props, afterQueryData, {
          updating: loading
        }, queryRest));
      }
    } else if (loading) {
      return /*#__PURE__*/_react.default.createElement(Loading, (0, _extends2.default)({}, queryRest, props));
    } else {
      /**
       * There really shouldn't be an `else` here, but like any piece of software, GraphQL clients have bugs.
       * If there's no `error` and there's no `data` and we're not `loading`, something's wrong. Most likely with the cache.
       *
       * @see {@link https://github.com/redwoodjs/redwood/issues/2473#issuecomment-971864604}
       */
      console.warn("If you're using Apollo Client, check for its debug logs here in the console, which may help explain the error.");
      throw new Error('Cannot render Cell: reached an unexpected state where the query succeeded but `data` is `null`. If this happened in Storybook, your query could be missing fields; otherwise this is most likely a GraphQL caching bug. Note that adding an `id` field to all the fields on your query may fix the issue.');
    }
  }

  NamedCell.displayName = displayName;
  return NamedCell;
}