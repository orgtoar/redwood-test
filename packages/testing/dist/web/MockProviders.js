"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mockAuthClient = exports.MockProviders = void 0;

var _react = _interopRequireDefault(require("react"));

var _auth = require("@redwoodjs/auth");

var _router = require("@redwoodjs/router");

var _web = require("@redwoodjs/web");

var _apollo = require("@redwoodjs/web/apollo");

var _MockParamsProvider = require("./MockParamsProvider");

var _mockRequests = require("./mockRequests");

/**
 * NOTE: This module should not contain any nodejs functionality,
 * because it's also used by Storybook in the browser.
 */
// Import the user's Router from `./web/src/Router.{tsx,js}`,
// we pass the `children` from the user's Router to `./MockRouter.Router`
// so that we can populate the `routes object` in Storybook and tests.
const {
  default: UserRouterWithRoutes
} = require('~__REDWOOD__USER_ROUTES_FOR_MOCK'); // TODO: make this AuthContextInterface & the below AuthClient more composable/extendable|"overwriteable"


const fakeUseAuth = () => ({
  loading: false,
  isAuthenticated: false,
  currentUser: null,
  userMetadata: null,
  logIn: async () => undefined,
  logOut: async () => undefined,
  signUp: async () => undefined,
  getToken: async () => null,
  getCurrentUser: async () => null,
  hasRole: () => false,
  reauthenticate: async () => undefined,
  forgotPassword: async () => undefined,
  resetPassword: async () => undefined,
  validateResetToken: async () => undefined,
  client: null,
  type: 'custom',
  hasError: false
});

const mockAuthClient = {
  restoreAuthState: () => {},
  login: async () => {},
  logout: () => {},
  signup: () => {},
  getToken: async () => {
    return 'token';
  },
  getUserMetadata: async () => {
    return _mockRequests.mockedUserMeta.currentUser;
  },
  forgotPassword: () => {},
  resetPassword: () => {},
  validateResetToken: () => {},
  client: 'Custom',
  type: 'custom'
};
exports.mockAuthClient = mockAuthClient;

const MockProviders = ({
  children
}) => {
  return /*#__PURE__*/_react.default.createElement(_auth.AuthProvider, {
    client: mockAuthClient,
    type: "custom"
  }, /*#__PURE__*/_react.default.createElement(_web.RedwoodProvider, {
    titleTemplate: "%PageTitle | %AppTitle"
  }, /*#__PURE__*/_react.default.createElement(_apollo.RedwoodApolloProvider, {
    useAuth: fakeUseAuth
  }, /*#__PURE__*/_react.default.createElement(UserRouterWithRoutes, null), /*#__PURE__*/_react.default.createElement(_router.LocationProvider, null, /*#__PURE__*/_react.default.createElement(_MockParamsProvider.MockParamsProvider, null, children)))));
};

exports.MockProviders = MockProviders;