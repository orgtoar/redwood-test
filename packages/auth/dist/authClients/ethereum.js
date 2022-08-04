"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ethereum = void 0;

const ethereum = client => {
  return {
    type: 'ethereum',
    client,
    login: async options => await client.login(options),
    signup: () => {
      throw new Error("Ethereum auth does not support \"signup\". Please use \"login\" instead.");
    },
    logout: async () => await client.logout(),
    getToken: async () => await client.getToken(),
    getUserMetadata: async () => await client.getUserMetadata()
  };
};

exports.ethereum = ethereum;