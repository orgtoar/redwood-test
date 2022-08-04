"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.supertokens = void 0;

const supertokens = client => {
  return {
    type: 'supertokens',
    client: undefined,
    login: async () => client.authRecipe.redirectToAuth('signin'),
    signup: async () => client.authRecipe.redirectToAuth('signup'),
    logout: async () => client.sessionRecipe.signOut(),
    getToken: async () => {
      if (await client.sessionRecipe.doesSessionExist()) {
        const accessTokenPayload = await client.sessionRecipe.getAccessTokenPayloadSecurely();
        const jwtPropertyName = accessTokenPayload['_jwtPName'];
        return accessTokenPayload[jwtPropertyName];
      } else {
        return null;
      }
    },
    getUserMetadata: async () => {
      if (await client.sessionRecipe.doesSessionExist()) {
        return {
          userId: await client.sessionRecipe.getUserId(),
          accessTokenPayload: await client.sessionRecipe.getAccessTokenPayloadSecurely()
        };
      } else {
        return null;
      }
    }
  };
};

exports.supertokens = supertokens;