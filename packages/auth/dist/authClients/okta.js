"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.okta = void 0;

const okta = client => {
  return {
    type: 'okta',
    client,
    restoreAuthState: async () => {
      const previousState = client.authStateManager.getPreviousAuthState();

      if (client.isLoginRedirect() && !previousState) {
        try {
          client.storeTokensFromRedirect();
        } catch (e) {
          console.error(e);
        }
      } else if (!(await client.isAuthenticated())) {
        client.signInWithRedirect();
      }
    },
    login: async options => client.signInWithRedirect(options),
    logout: () => client.signOut(),
    signup: async options => client.signInWithRedirect(options),
    getToken: async () => client.tokenManager.get('accessToken').then(res => {
      return res.accessToken;
    }),
    getUserMetadata: async () => {
      const user = client.token.getUserInfo();
      return user || null;
    }
  };
};

exports.okta = okta;