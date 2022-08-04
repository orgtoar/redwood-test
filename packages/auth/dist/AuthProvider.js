"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthProvider = exports.AuthContext = void 0;

var _react = _interopRequireWildcard(require("react"));

var _authClients = require("./authClients");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const AuthContext = /*#__PURE__*/_react.default.createContext({
  loading: true,
  isAuthenticated: false,
  userMetadata: null,
  currentUser: null,
  logIn: () => Promise.resolve(),
  logOut: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  getToken: () => Promise.resolve(null),
  getCurrentUser: () => Promise.resolve(null),
  hasRole: () => true,
  reauthenticate: () => Promise.resolve(),
  forgotPassword: () => Promise.resolve(),
  resetPassword: () => Promise.resolve(),
  validateResetToken: () => Promise.resolve(),
  hasError: false
});

exports.AuthContext = AuthContext;

const AuthUpdateListener = _ref => {
  var _rwClient$useListenFo;

  let {
    rwClient,
    reauthenticate
  } = _ref;
  rwClient === null || rwClient === void 0 ? void 0 : (_rwClient$useListenFo = rwClient.useListenForUpdates) === null || _rwClient$useListenFo === void 0 ? void 0 : _rwClient$useListenFo.call(rwClient, {
    reauthenticate
  });
  return null;
};

const defaultAuthProviderState = {
  loading: true,
  isAuthenticated: false,
  userMetadata: null,
  currentUser: null,
  hasError: false
};
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

const AuthProvider = props => {
  const skipFetchCurrentUser = props.skipFetchCurrentUser || false;
  const [hasRestoredState, setHasRestoredState] = (0, _react.useState)(false);
  const [authProviderState, setAuthProviderState] = (0, _react.useState)(defaultAuthProviderState);
  const [rwClient, setRwClient] = (0, _react.useState)();
  const rwClientPromise = (0, _react.useMemo)(async () => {
    // If ever we rebuild the rwClient, we need to re-restore the state.
    // This is not desired behavior, but may happen if for some reason the host app's
    // auth configuration changes mid-flight.
    setHasRestoredState(false);
    const client = await (0, _authClients.createAuthClient)(props.client, props.type, props.config);
    setRwClient(client);
    return client;
  }, [props.client, props.type, props.config]);
  /**
   * Clients should always return null or token string.
   * It is expected that they catch any errors internally.
   * This catch is a last resort effort in case any errors are
   * missed or slip through.
   */

  const getToken = (0, _react.useCallback)(async () => {
    const client = await rwClientPromise;

    try {
      const token = await client.getToken();
      return token;
    } catch (e) {
      console.error('Caught internal:', e);
      return null;
    }
  }, [rwClientPromise]);
  const getCurrentUser = (0, _react.useCallback)(async () => {
    const client = await rwClientPromise; // Always get a fresh token, rather than use the one in state

    const token = await getToken();
    const response = await global.fetch(global.RWJS_API_GRAPHQL_URL, {
      method: 'POST',
      // TODO: how can user configure this? inherit same `config` options given to auth client?
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        'auth-provider': client.type,
        authorization: "Bearer ".concat(token)
      },
      body: JSON.stringify({
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
      throw new Error("Could not fetch current user: ".concat(response.statusText, " (").concat(response.status, ")"));
    }
  }, [rwClientPromise, getToken]);
  const reauthenticate = (0, _react.useCallback)(async () => {
    const client = await rwClientPromise;
    const notAuthenticatedState = {
      isAuthenticated: false,
      currentUser: null,
      userMetadata: null,
      loading: false,
      hasError: false
    };

    try {
      const userMetadata = await client.getUserMetadata();

      if (!userMetadata) {
        setAuthProviderState(notAuthenticatedState);
      } else {
        await getToken();
        const currentUser = skipFetchCurrentUser ? null : await getCurrentUser();
        setAuthProviderState(oldState => ({ ...oldState,
          userMetadata,
          currentUser,
          isAuthenticated: true,
          loading: false
        }));
      }
    } catch (e) {
      setAuthProviderState({ ...notAuthenticatedState,
        hasError: true,
        error: e
      });
    }
  }, [getToken, rwClientPromise, setAuthProviderState, skipFetchCurrentUser, getCurrentUser]);
  /**
   * @example
   * ```js
   *  hasRole("editor")
   *  hasRole(["editor"])
   *  hasRole(["editor", "author"])
   * ```
   *
   * Checks if the "currentUser" from the api side
   * is assigned a role or one of a list of roles.
   * If the user is assigned any of the provided list of roles,
   * the hasRole is considered to be true.
   */

  const hasRole = (0, _react.useCallback)(rolesToCheck => {
    const currentUser = authProviderState.currentUser;

    if (currentUser !== null && currentUser !== void 0 && currentUser.roles) {
      if (typeof rolesToCheck === 'string') {
        if (typeof currentUser.roles === 'string') {
          // rolesToCheck is a string, currentUser.roles is a string
          return currentUser.roles === rolesToCheck;
        } else if (Array.isArray(currentUser.roles)) {
          var _currentUser$roles;

          // rolesToCheck is a string, currentUser.roles is an array
          return (_currentUser$roles = currentUser.roles) === null || _currentUser$roles === void 0 ? void 0 : _currentUser$roles.some(allowedRole => rolesToCheck === allowedRole);
        }
      }

      if (Array.isArray(rolesToCheck)) {
        if (Array.isArray(currentUser.roles)) {
          var _currentUser$roles2;

          // rolesToCheck is an array, currentUser.roles is an array
          return (_currentUser$roles2 = currentUser.roles) === null || _currentUser$roles2 === void 0 ? void 0 : _currentUser$roles2.some(allowedRole => rolesToCheck.includes(allowedRole));
        } else if (typeof currentUser.roles === 'string') {
          // rolesToCheck is an array, currentUser.roles is a string
          return rolesToCheck.some(allowedRole => (currentUser === null || currentUser === void 0 ? void 0 : currentUser.roles) === allowedRole);
        }
      }
    }

    return false;
  }, [authProviderState.currentUser]);
  const logIn = (0, _react.useCallback)(async options => {
    setAuthProviderState(defaultAuthProviderState);
    const client = await rwClientPromise;
    const loginOutput = await client.login(options);
    await reauthenticate();
    return loginOutput;
  }, [rwClientPromise, reauthenticate]);
  const logOut = (0, _react.useCallback)(async options => {
    const client = await rwClientPromise;
    await client.logout(options);
    setAuthProviderState({
      userMetadata: null,
      currentUser: null,
      isAuthenticated: false,
      hasError: false,
      error: undefined,
      loading: false
    });
  }, [rwClientPromise]);
  const signUp = (0, _react.useCallback)(async options => {
    const client = await rwClientPromise;
    const signupOutput = await client.signup(options);
    await reauthenticate();
    return signupOutput;
  }, [rwClientPromise, reauthenticate]);
  const forgotPassword = (0, _react.useCallback)(async username => {
    const client = await rwClientPromise;

    if (client.forgotPassword) {
      return await client.forgotPassword(username);
    } else {
      throw new Error("Auth client ".concat(client.type, " does not implement this function"));
    }
  }, [rwClientPromise]);
  const resetPassword = (0, _react.useCallback)(async options => {
    const client = await rwClientPromise;

    if (client.resetPassword) {
      return await client.resetPassword(options);
    } else {
      throw new Error("Auth client ".concat(client.type, " does not implement this function"));
    }
  }, [rwClientPromise]);
  const validateResetToken = (0, _react.useCallback)(async resetToken => {
    const client = await rwClientPromise;

    if (client.validateResetToken) {
      return await client.validateResetToken(resetToken);
    } else {
      throw new Error("Auth client ".concat(client.type, " does not implement this function"));
    }
  }, [rwClientPromise]);
  /** Whenever the rwClient is ready to go, restore auth and reauthenticate */

  (0, _react.useEffect)(() => {
    if (rwClient && !hasRestoredState) {
      setHasRestoredState(true);

      const doRestoreState = async () => {
        var _rwClient$restoreAuth;

        await ((_rwClient$restoreAuth = rwClient.restoreAuthState) === null || _rwClient$restoreAuth === void 0 ? void 0 : _rwClient$restoreAuth.call(rwClient));
        reauthenticate();
      };

      doRestoreState();
    }
  }, [rwClient, reauthenticate, hasRestoredState]);
  const {
    client,
    type,
    children
  } = props;
  return /*#__PURE__*/_react.default.createElement(AuthContext.Provider, {
    value: { ...authProviderState,
      logIn,
      logOut,
      signUp,
      getToken,
      getCurrentUser,
      hasRole,
      reauthenticate,
      forgotPassword,
      resetPassword,
      validateResetToken,
      client,
      type: type
    }
  }, children, /*#__PURE__*/_react.default.createElement(AuthUpdateListener, {
    rwClient: rwClient,
    reauthenticate: reauthenticate
  }));
};

exports.AuthProvider = AuthProvider;