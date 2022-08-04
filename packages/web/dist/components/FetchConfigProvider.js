"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useFetchConfig = exports.getApiGraphQLUrl = exports.FetchConfigProvider = exports.FetchConfigContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

const getApiGraphQLUrl = () => {
  return global.RWJS_API_GRAPHQL_URL;
};

exports.getApiGraphQLUrl = getApiGraphQLUrl;

const FetchConfigContext = _react.default.createContext({
  uri: getApiGraphQLUrl()
});

exports.FetchConfigContext = FetchConfigContext;
const defaultAuthState = {
  loading: false,
  isAuthenticated: false
};

/**
 * The `FetchConfigProvider` understands Redwood's Auth and determines the
 * correct request-headers based on a user's authentication state.
 * Note that the auth bearer token is now passed in packages/web/src/apollo/index.tsx
 * as the token is retrieved async
 */
const FetchConfigProvider = _ref => {
  var _global$__REDWOOD__US;

  let {
    useAuth = (_global$__REDWOOD__US = global.__REDWOOD__USE_AUTH) !== null && _global$__REDWOOD__US !== void 0 ? _global$__REDWOOD__US : () => defaultAuthState,
    ...rest
  } = _ref;
  const {
    isAuthenticated,
    type
  } = useAuth();

  if (!isAuthenticated) {
    return /*#__PURE__*/_react.default.createElement(FetchConfigContext.Provider, (0, _extends2.default)({
      value: {
        uri: getApiGraphQLUrl()
      }
    }, rest));
  }

  return /*#__PURE__*/_react.default.createElement(FetchConfigContext.Provider, (0, _extends2.default)({
    value: {
      uri: getApiGraphQLUrl(),
      headers: {
        'auth-provider': type
      }
    }
  }, rest));
};

exports.FetchConfigProvider = FetchConfigProvider;

const useFetchConfig = () => _react.default.useContext(FetchConfigContext);

exports.useFetchConfig = useFetchConfig;