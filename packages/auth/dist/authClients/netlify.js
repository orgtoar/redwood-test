"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.netlify = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

const netlify = client => {
  return {
    type: 'netlify',
    client,
    login: () => {
      return new _promise.default((resolve, reject) => {
        let autoClosedModal = false;
        client.open('login');
        client.on('login', user => {
          // This closes the modal which pops-up immediately after you login.
          autoClosedModal = true;
          client.close();
          return resolve(user);
        });
        client.on('close', () => {
          !autoClosedModal && resolve(null);
        });
        client.on('error', reject);
      });
    },
    logout: () => {
      return new _promise.default((resolve, reject) => {
        client.logout();
        client.on('logout', resolve);
        client.on('error', reject);
      });
    },
    signup: () => {
      return new _promise.default((resolve, reject) => {
        client.open('signup');
        client.on('close', () => {
          resolve(null);
        });
        client.on('error', reject);
      });
    },
    getToken: async () => {
      try {
        var _user$token;

        // The client refresh function only actually refreshes token
        // when it's been expired. Don't panic
        await client.refresh();
        const user = await client.currentUser();
        return (user === null || user === void 0 ? void 0 : (_user$token = user.token) === null || _user$token === void 0 ? void 0 : _user$token.access_token) || null;
      } catch {
        return null;
      }
    },
    getUserMetadata: async () => {
      return client.currentUser();
    },
    restoreAuthState: async () => {
      return client.currentUser();
    }
  };
};

exports.netlify = netlify;