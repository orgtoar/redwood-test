"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.goTrue = void 0;

const goTrue = client => {
  return {
    type: 'goTrue',
    client,
    login: async _ref => {
      let {
        email,
        password,
        remember
      } = _ref;
      return client.login(email, password, remember);
    },
    logout: async () => {
      const user = await client.currentUser();
      return user === null || user === void 0 ? void 0 : user.logout();
    },
    signup: async _ref2 => {
      let {
        email,
        password,
        remember
      } = _ref2;
      return client.signup(email, password, remember);
    },
    getToken: async () => {
      try {
        const user = await client.currentUser();
        return (user === null || user === void 0 ? void 0 : user.jwt()) || null;
      } catch {
        return null;
      }
    },
    getUserMetadata: async () => client.currentUser()
  };
};

exports.goTrue = goTrue;