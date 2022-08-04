"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.azureActiveDirectory = void 0;

const azureActiveDirectory = client => {
  return {
    type: 'azureActiveDirectory',
    client,
    login: async options => client.loginRedirect(options),
    logout: options => client.logoutRedirect(options),
    signup: async options => client.loginRedirect(options),
    getToken: async options => {
      // Default scopes if options is not passed
      const request = options || {
        scopes: ['openid', 'profile']
      }; // The recommended call pattern is to first try to call acquireTokenSilent,
      // and if it fails with a InteractionRequiredAuthError, call acquireTokenRedirect
      // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/acquire-token.md
      // NOTE: We are not catching by the `InteractionRequiredAuthError`, perhaps we
      // can branch off `error.name` if this strategy doesn't work properly.

      try {
        const token = await client.acquireTokenSilent(request);
        return token.idToken;
      } catch (err) {
        client.acquireTokenRedirect(request);
      }

      return null;
    },
    getUserMetadata: async () => {
      return client.getActiveAccount();
    },
    restoreAuthState: async () => {
      // As we are using the redirect flow, we need to call and wait for handleRedirectPromise to complete.
      // This should only happen on a valid redirect, and having it in the restoreAuthState makes sense for now.
      // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/v1-migration.md#3-update-your-code
      await client.handleRedirectPromise().then(token => {
        if (token) {
          // Get accounts
          const accounts = client.getAllAccounts();

          switch (accounts.length) {
            case 0:
              // No accounts so we need to login
              client.loginRedirect();
              break;

            case 1:
              // We have one account so we can set it as active
              client.setActiveAccount(accounts[0]);
              break;

            default:
              // We most likely have multiple accounts so we need to ask the user which one to use
              client.loginRedirect();
          }
        }
      });
    }
  };
};

exports.azureActiveDirectory = azureActiveDirectory;