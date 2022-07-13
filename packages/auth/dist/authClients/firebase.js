"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.firebase = void 0;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

// @TODO: Firebase doesn't export a list of providerIds they use
// But I found them here: https://github.com/firebase/firebase-js-sdk/blob/a5768b0aa7d7ce732279931aa436e988c9f36487/packages/rules-unit-testing/src/api/index.ts
// NOTE 10/21/21: Firebase does appear to export a const enum_map of providerIds:
// https://github.com/firebase/firebase-js-sdk/blob/master/packages/auth/src/model/enum_maps.ts#L28-L46
// It may be possible to just use the exported enum map ala https://github.com/redwoodjs/redwood/pull/3537/files#r733851673
const hasPasswordCreds = options => {
  return options.email !== undefined && options.password !== undefined;
};

const applyProviderOptions = (provider, options) => {
  if (options.customParameters) {
    provider.setCustomParameters(options.customParameters);
  }

  if (options.scopes) {
    var _context;

    (0, _forEach.default)(_context = options.scopes).call(_context, scope => provider.addScope(scope));
  }

  return provider;
};

const firebase = _ref => {
  let {
    firebaseAuth,
    firebaseApp
  } = _ref;
  const auth = firebaseAuth.getAuth(firebaseApp);

  function getProvider(providerId) {
    return new firebaseAuth.OAuthProvider(providerId);
  }

  const loginWithEmailLink = _ref2 => {
    let {
      email,
      emailLink
    } = _ref2;

    if (email !== undefined && emailLink !== undefined && firebaseAuth.isSignInWithEmailLink(auth, emailLink)) {
      return firebaseAuth.signInWithEmailLink(auth, email, emailLink);
    }

    return undefined;
  };

  return {
    type: 'firebase',
    client: auth,
    restoreAuthState: () => {
      // The first firing of onAuthStateChange indicates that firebase auth has
      // loaded and the state is ready to be read. Unsubscribe after this first firing.
      return new _promise.default((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
        }, reject);
      });
    },
    login: async function () {
      let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        providerId: 'google.com'
      };

      // If argument provided is a string, it should be the oAuth Provider
      // Cast the provider string into the options object
      if (typeof options === 'string') {
        options = {
          providerId: options
        };
      }

      if (hasPasswordCreds(options)) {
        return firebaseAuth.signInWithEmailAndPassword(auth, options.email, options.password);
      }

      if (options.providerId === 'emailLink') {
        return loginWithEmailLink(options);
      }

      if (options.providerId === 'customToken' && options.customToken) {
        return firebaseAuth.signInWithCustomToken(auth, options.customToken);
      }

      const provider = getProvider(options.providerId || 'google.com');
      const providerWithOptions = applyProviderOptions(provider, options);
      return firebaseAuth.signInWithPopup(auth, providerWithOptions);
    },
    logout: async () => auth.signOut(),
    signup: function () {
      let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        providerId: 'google.com'
      };

      if (typeof options === 'string') {
        options = {
          providerId: options
        };
      }

      if (hasPasswordCreds(options)) {
        return firebaseAuth.createUserWithEmailAndPassword(auth, options.email, options.password);
      }

      if (options.providerId === 'emailLink') {
        return loginWithEmailLink(options);
      }

      if (options.providerId === 'customToken' && options.customToken) {
        return firebaseAuth.signInWithCustomToken(auth, options.customToken);
      }

      const provider = getProvider(options.providerId || 'google.com');
      const providerWithOptions = applyProviderOptions(provider, options);
      return firebaseAuth.signInWithPopup(auth, providerWithOptions);
    },
    getToken: async () => {
      return auth.currentUser ? auth.currentUser.getIdToken() : null;
    },
    getUserMetadata: async () => {
      return auth.currentUser;
    }
  };
};

exports.firebase = firebase;