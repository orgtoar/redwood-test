"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.supabase = void 0;

const supabase = client => {
  return {
    type: 'supabase',
    client,
    login: async _ref => {
      let {
        email,
        password,
        phone,
        provider,
        refreshToken,
        redirectTo,
        scopes
      } = _ref;
      return await client.auth.signIn({
        email,
        phone,
        password,
        refreshToken,
        provider
      }, {
        redirectTo,
        scopes
      });
    },
    logout: async () => {
      return await client.auth.signOut();
    },
    signup: async _ref2 => {
      let {
        email,
        password,
        phone,
        redirectTo
      } = _ref2;
      return await client.auth.signUp({
        email,
        password,
        phone
      }, {
        redirectTo
      });
    },
    getToken: async () => {
      const currentSession = client.auth.session();
      return (currentSession === null || currentSession === void 0 ? void 0 : currentSession.access_token) || null;
    },
    getUserMetadata: async () => {
      return await client.auth.user();
    },
    restoreAuthState: async () => {
      const {
        data: session
      } = await client.auth.getSessionFromUrl(); // Modify URL state only if there is a session.
      // Prevents resetting URL state (like query params) for all other cases.

      if (session) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      return;
    },
    verifyOTP: async _ref3 => {
      let {
        phone,
        token,
        redirectTo
      } = _ref3;
      return await client.auth.verifyOTP({
        phone,
        token
      }, {
        redirectTo
      });
    }
  };
};

exports.supabase = supabase;