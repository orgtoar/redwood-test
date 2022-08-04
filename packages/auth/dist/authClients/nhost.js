"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nhost = void 0;

const nhost = client => {
  return {
    type: 'nhost',
    client,
    login: async options => {
      return await client.auth.signIn(options);
    },
    logout: async () => {
      return await client.auth.signOut();
    },
    signup: async options => {
      return await client.auth.signUp(options);
    },
    getToken: async () => {
      return (await client.auth.getJWTToken()) || null;
    },
    getUserMetadata: async () => {
      return await client.auth.getUser();
    },
    restoreAuthState: async () => {
      return await client.auth.refreshSession();
    }
  };
};

exports.nhost = nhost;