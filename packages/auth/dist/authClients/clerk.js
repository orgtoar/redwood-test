"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.clerk = void 0;

// In production, there is an issue where the AuthProvider sometimes captures
// Clerk as null. This intercepts that
// issue and falls back to `window.Clerk` to access the client.
function clerkClient(propsClient) {
  if (!propsClient) {
    var _window$Clerk;

    return (_window$Clerk = window.Clerk) !== null && _window$Clerk !== void 0 ? _window$Clerk : null;
  } else {
    return propsClient;
  }
}

const clerk = client => {
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