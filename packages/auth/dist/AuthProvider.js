"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.AuthProvider = exports.AuthContext = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/is-array"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _react = _interopRequireDefault(require("react"));

var _authClients = require("./authClients");

const AuthContext = /*#__PURE__*/_react.default.createContext({
  loading: true,
  isAuthenticated: false,
  userMetadata: null,
  currentUser: null,
  logIn: () => _promise.default.resolve(),
  logOut: () => _promise.default.resolve(),
  signUp: () => _promise.default.resolve(),
  getToken: () => _promise.default.resolve(null),
  getCurrentUser: () => _promise.default.resolve(null),
  hasRole: () => true,
  reauthenticate: () => _promise.default.resolve(),
  forgotPassword: () => _promise.default.resolve(),
  resetPassword: () => _promise.default.resolve(),
  validateResetToken: () => _promise.default.resolve(),
  hasError: false
});

exports.AuthContext = AuthContext;

/**
 * @example
 * ```js
 *  const client = new Auth0Client(options)
 *  // ...
 *  <AuthProvider client={client} type="auth0" skipFetchCurrentUser={true}>
 *    {children}
 *  </AuthProvider>
 * ```
 */
class AuthProvider extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isAuthenticated: false,
      userMetadata: null,
      currentUser: null,
      hasError: false
    };
    this.rwClient = void 0;

    this.getApiGraphQLUrl = () => {
      return global.RWJS_API_GRAPHQL_URL;
    };

    this.getCurrentUser = async () => {
      // Always get a fresh token, rather than use the one in state
      const token = await this.getToken();
      const response = await global.fetch(this.getApiGraphQLUrl(), {
        method: 'POST',
        // TODO: how can user configure this? inherit same `config` options given to auth client?
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
          'auth-provider': this.rwClient.type,
          authorization: "Bearer ".concat(token)
        },
        body: (0, _stringify.default)({
          query: 'query __REDWOOD__AUTH_GET_CURRENT_USER { redwood { currentUser } }'
        })
      });

      if (response.ok) {
        var _data$redwood;

        const {
          data
        } = await response.json();
        return data === null || data === void 0 ? void 0 : (_data$redwood = data.redwood) === null || _data$redwood === void 0 ? void 0 : _data$redwood.currentUser;
      } else {
        var _context;

        throw new Error((0, _concat.default)(_context = "Could not fetch current user: ".concat(response.statusText, " (")).call(_context, response.status, ")"));
      }
    };

    this.hasRole = rolesToCheck => {
      var _this$state$currentUs;

      if ((_this$state$currentUs = this.state.currentUser) !== null && _this$state$currentUs !== void 0 && _this$state$currentUs.roles) {
        if (typeof rolesToCheck === 'string') {
          if (typeof this.state.currentUser.roles === 'string') {
            // rolesToCheck is a string, currentUser.roles is a string
            return this.state.currentUser.roles === rolesToCheck;
          } else if ((0, _isArray.default)(this.state.currentUser.roles)) {
            var _this$state$currentUs2;

            // rolesToCheck is a string, currentUser.roles is an array
            return (_this$state$currentUs2 = this.state.currentUser.roles) === null || _this$state$currentUs2 === void 0 ? void 0 : (0, _some.default)(_this$state$currentUs2).call(_this$state$currentUs2, allowedRole => rolesToCheck === allowedRole);
          }
        }

        if ((0, _isArray.default)(rolesToCheck)) {
          if ((0, _isArray.default)(this.state.currentUser.roles)) {
            var _this$state$currentUs3;

            // rolesToCheck is an array, currentUser.roles is an array
            return (_this$state$currentUs3 = this.state.currentUser.roles) === null || _this$state$currentUs3 === void 0 ? void 0 : (0, _some.default)(_this$state$currentUs3).call(_this$state$currentUs3, allowedRole => (0, _includes.default)(rolesToCheck).call(rolesToCheck, allowedRole));
          } else if (typeof this.state.currentUser.roles === 'string') {
            // rolesToCheck is an array, currentUser.roles is a string
            return (0, _some.default)(rolesToCheck).call(rolesToCheck, allowedRole => {
              var _this$state$currentUs4;

              return ((_this$state$currentUs4 = this.state.currentUser) === null || _this$state$currentUs4 === void 0 ? void 0 : _this$state$currentUs4.roles) === allowedRole;
            });
          }
        }
      }

      return false;
    };

    this.getToken = async () => {
      let token;

      try {
        token = await this.rwClient.getToken();
      } catch {
        token = null;
      }

      return token;
    };

    this.reauthenticate = async () => {
      const notAuthenticatedState = {
        isAuthenticated: false,
        currentUser: null,
        userMetadata: null,
        loading: false,
        hasError: false
      };

      try {
        const userMetadata = await this.rwClient.getUserMetadata();

        if (!userMetadata) {
          this.setState(notAuthenticatedState);
        } else {
          await this.getToken();
          const currentUser = this.props.skipFetchCurrentUser ? null : await this.getCurrentUser();
          this.setState({ ...this.state,
            userMetadata,
            currentUser,
            isAuthenticated: true,
            loading: false
          });
        }
      } catch (e) {
        this.setState({ ...notAuthenticatedState,
          hasError: true,
          error: e
        });
      }
    };

    this.logIn = async options => {
      this.setState({
        loading: true
      });
      const loginOutput = await this.rwClient.login(options);
      await this.reauthenticate();
      return loginOutput;
    };

    this.logOut = async options => {
      await this.rwClient.logout(options);
      this.setState({
        userMetadata: null,
        currentUser: null,
        isAuthenticated: false,
        hasError: false,
        error: undefined
      });
    };

    this.signUp = async options => {
      const signupOutput = await this.rwClient.signup(options);
      await this.reauthenticate();
      return signupOutput;
    };

    this.forgotPassword = async username => {
      if (this.rwClient.forgotPassword) {
        return await this.rwClient.forgotPassword(username);
      } else {
        throw new Error("Auth client ".concat(this.rwClient.type, " does not implement this function"));
      }
    };

    this.resetPassword = async options => {
      if (this.rwClient.resetPassword) {
        return await this.rwClient.resetPassword(options);
      } else {
        throw new Error("Auth client ".concat(this.rwClient.type, " does not implement this function"));
      }
    };

    this.validateResetToken = async resetToken => {
      if (this.rwClient.validateResetToken) {
        return await this.rwClient.validateResetToken(resetToken);
      } else {
        throw new Error("Auth client ".concat(this.rwClient.type, " does not implement this function"));
      }
    };

    this.rwClient = (0, _authClients.createAuthClient)(props.client, props.type, props.config);
  }

  async componentDidMount() {
    var _this$rwClient$restor, _this$rwClient;

    await ((_this$rwClient$restor = (_this$rwClient = this.rwClient).restoreAuthState) === null || _this$rwClient$restor === void 0 ? void 0 : _this$rwClient$restor.call(_this$rwClient));
    return this.reauthenticate();
  }

  render() {
    const {
      client,
      type,
      children
    } = this.props;
    return /*#__PURE__*/_react.default.createElement(AuthContext.Provider, {
      value: { ...this.state,
        logIn: this.logIn,
        logOut: this.logOut,
        signUp: this.signUp,
        getToken: this.getToken,
        getCurrentUser: this.getCurrentUser,
        hasRole: this.hasRole,
        reauthenticate: this.reauthenticate,
        forgotPassword: this.forgotPassword,
        resetPassword: this.resetPassword,
        validateResetToken: this.validateResetToken,
        client,
        type: type
      }
    }, children);
  }

}

exports.AuthProvider = AuthProvider;
AuthProvider.defaultProps = {
  skipFetchCurrentUser: false
};