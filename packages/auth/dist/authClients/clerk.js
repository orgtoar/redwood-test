"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.clerk = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _react = require("react");

// Because Clerk's client is nulled out while it is loading, there is a race
// condition under normal usage on a clean load of the app. This falls back
// to the window.Clerk property when necessary to circumvent that.
function clerkClient(propsClient) {
  if (!propsClient && typeof window !== undefined) {
    var _Clerk;

    return (_Clerk = window.Clerk) !== null && _Clerk !== void 0 ? _Clerk : null;
  } else {
    return propsClient;
  }
}

const clerk = async client => {
  // We use the typescript dynamic import feature to pull in the react library only if clerk is needed.
  const {
    useUser: useClerkUser
  } = await _promise.default.resolve().then(() => (0, _interopRequireWildcard2.default)(require('@clerk/clerk-react')));
  return {
    type: 'clerk',
    client,
    login: async options => {
      var _clerkClient;

      return (_clerkClient = clerkClient(client)) === null || _clerkClient === void 0 ? void 0 : _clerkClient.openSignIn(options || {});
    },
    logout: async (callbackOrOptions, options) => {
      var _clerkClient2;

      return (_clerkClient2 = clerkClient(client)) === null || _clerkClient2 === void 0 ? void 0 : _clerkClient2.signOut(callbackOrOptions, options);
    },
    signup: async options => {
      var _clerkClient3;

      return (_clerkClient3 = clerkClient(client)) === null || _clerkClient3 === void 0 ? void 0 : _clerkClient3.openSignUp(options || {});
    },
    restoreAuthState: async () => {
      const clerk = clerkClient(client);

      if (!clerk) {
        // If the client is null, we can't restore state or listen for it to happen.
        // This behavior is somewhat undefined, which is why we instruct the user to wrap
        // the auth provider in <ClerkLoaded> to prevent it. For now we'll just return.
        if (process.env.NODE_ENV === 'development') {
          console.log('Please wrap your auth provider with `<ClerkLoaded>`');
        }

        return;
      } // NOTE: Clerk's API docs say session will be undefined if loading (null if loaded and confirmed unset).


      if (!clerk.client || clerk.session !== undefined) {
        return new _promise.default(res => {
          clerk.addListener(msg => {
            if (msg.session !== undefined && msg.client) {
              res();
            }
          });
        });
      } else {
        // In this case, we assume everything has been restored already.
        return;
      }
    },
    // Hook to inform AuthProvider of Clerk's life-cycle
    useListenForUpdates: _ref => {
      let {
        reauthenticate
      } = _ref;
      const {
        isSignedIn,
        user,
        isLoaded
      } = useClerkUser();
      (0, _react.useEffect)(() => {
        if (isLoaded) {
          reauthenticate();
        }
      }, [isSignedIn, user, reauthenticate, isLoaded]);
    },
    getToken: async options => {
      let token;

      try {
        var _clerkClient4, _clerkClient4$session;

        token = await ((_clerkClient4 = clerkClient(client)) === null || _clerkClient4 === void 0 ? void 0 : (_clerkClient4$session = _clerkClient4.session) === null || _clerkClient4$session === void 0 ? void 0 : _clerkClient4$session.getToken(options));
      } catch {
        token = null;
      }

      return token || null;
    },
    getUserMetadata: async () => {
      var _clerkClient5, _clerkClient6, _clerkClient$user$pub, _clerkClient7, _clerkClient7$user, _clerkClient7$user$pu;

      return (_clerkClient5 = clerkClient(client)) !== null && _clerkClient5 !== void 0 && _clerkClient5.user ? { ...((_clerkClient6 = clerkClient(client)) === null || _clerkClient6 === void 0 ? void 0 : _clerkClient6.user),
        roles: (_clerkClient$user$pub = (_clerkClient7 = clerkClient(client)) === null || _clerkClient7 === void 0 ? void 0 : (_clerkClient7$user = _clerkClient7.user) === null || _clerkClient7$user === void 0 ? void 0 : (_clerkClient7$user$pu = _clerkClient7$user.publicMetadata) === null || _clerkClient7$user$pu === void 0 ? void 0 : _clerkClient7$user$pu['roles']) !== null && _clerkClient$user$pub !== void 0 ? _clerkClient$user$pub : []
      } : null;
    }
  };
};

exports.clerk = clerk;