"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.auth0 = void 0;

// TODO: Map out this user properly.
const auth0 = client => {
  return {
    type: 'auth0',
    client,
    restoreAuthState: async () => {
      var _global, _global$location, _global$location$sear, _global2, _global2$location, _global2$location$sea;

      if ((_global = global) !== null && _global !== void 0 && (_global$location = _global.location) !== null && _global$location !== void 0 && (_global$location$sear = _global$location.search) !== null && _global$location$sear !== void 0 && _global$location$sear.includes('code=') && (_global2 = global) !== null && _global2 !== void 0 && (_global2$location = _global2.location) !== null && _global2$location !== void 0 && (_global2$location$sea = _global2$location.search) !== null && _global2$location$sea !== void 0 && _global2$location$sea.includes('state=')) {
        var _global3, _global3$location;

        const {
          appState
        } = await client.handleRedirectCallback();
        const url = appState && appState.targetUrl ? appState.targetUrl : window.location.pathname;
        (_global3 = global) === null || _global3 === void 0 ? void 0 : (_global3$location = _global3.location) === null || _global3$location === void 0 ? void 0 : _global3$location.assign(url);
      }
    },
    login: async options => client.loginWithRedirect(options),
    logout: options => client.logout(options),
    signup: async options => client.loginWithRedirect({ ...options,
      screen_hint: 'signup',
      prompt: 'login'
    }),
    getToken: async () => client.getTokenSilently(),
    getUserMetadata: async () => {
      const user = await client.getUser();
      return user || null;
    }
  };
};

exports.auth0 = auth0;