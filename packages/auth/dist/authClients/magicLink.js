"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.magicLink = void 0;

const magicLink = client => {
  let token;
  let expireTime = 0;
  return {
    type: 'magicLink',
    client,
    login: async _ref => {
      let {
        email,
        showUI = true
      } = _ref;
      return await client.auth.loginWithMagicLink({
        email,
        showUI
      });
    },
    logout: async () => {
      token = null;
      expireTime = 0;
      await client.user.logout();
    },
    signup: async _ref2 => {
      let {
        email,
        showUI = true
      } = _ref2;
      return await client.auth.loginWithMagicLink({
        email,
        showUI
      });
    },
    getToken: async () => {
      if (!token || Date.now() > expireTime) {
        expireTime = Date.now() + 10 * 60 * 1000; // now + 10 min

        return token = await client.user.getIdToken();
      } else {
        return token;
      }
    },
    getUserMetadata: async () => (await client.user.isLoggedIn()) ? await client.user.getMetadata() : null
  };
};

exports.magicLink = magicLink;