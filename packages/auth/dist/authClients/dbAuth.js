"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dbAuth = void 0;
const TOKEN_CACHE_TIME = 5000;
let getTokenPromise;
let lastTokenCheckAt = new Date('1970-01-01T00:00:00');
let cachedToken;

const dbAuth = function (client) {
  let config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    fetchConfig: {
      credentials: 'same-origin'
    }
  };
  const {
    credentials
  } = config.fetchConfig;

  const resetAndFetch = async function () {
    resetTokenCache();
    return fetch(...arguments);
  };

  const isTokenCacheExpired = () => {
    const now = new Date();
    return now.getTime() - lastTokenCheckAt.getTime() > TOKEN_CACHE_TIME;
  };

  const resetTokenCache = () => {
    lastTokenCheckAt = new Date('1970-01-01T00:00:00');
    cachedToken = null;
  };

  const forgotPassword = async username => {
    const response = await resetAndFetch(global.RWJS_API_DBAUTH_URL, {
      credentials,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        method: 'forgotPassword'
      })
    });
    return await response.json();
  };

  const getToken = async () => {
    // Return the existing fetch promise, so that parallel calls
    // to getToken only cause a single fetch
    if (getTokenPromise) {
      return getTokenPromise;
    }

    if (isTokenCacheExpired()) {
      getTokenPromise = fetch("".concat(global.RWJS_API_DBAUTH_URL, "?method=getToken"), {
        credentials
      }).then(response => response.text()).then(tokenText => {
        lastTokenCheckAt = new Date();
        getTokenPromise = null;
        cachedToken = tokenText.length === 0 ? null : tokenText;
        return cachedToken;
      });
      return getTokenPromise;
    }

    return cachedToken;
  };

  const login = async attributes => {
    const {
      username,
      password
    } = attributes;
    const response = await resetAndFetch(global.RWJS_API_DBAUTH_URL, {
      credentials,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        method: 'login'
      })
    });
    return await response.json();
  };

  const logout = async () => {
    await resetAndFetch(global.RWJS_API_DBAUTH_URL, {
      credentials,
      method: 'POST',
      body: JSON.stringify({
        method: 'logout'
      })
    });
    return true;
  };

  const resetPassword = async attributes => {
    const response = await resetAndFetch(global.RWJS_API_DBAUTH_URL, {
      credentials,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...attributes,
        method: 'resetPassword'
      })
    });
    return await response.json();
  };

  const signup = async attributes => {
    const response = await resetAndFetch(global.RWJS_API_DBAUTH_URL, {
      credentials,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...attributes,
        method: 'signup'
      })
    });
    return await response.json();
  };

  const validateResetToken = async resetToken => {
    const response = await resetAndFetch(global.RWJS_API_DBAUTH_URL, {
      credentials,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resetToken,
        method: 'validateResetToken'
      })
    });
    return await response.json();
  };

  return {
    type: 'dbAuth',
    client,
    login,
    logout,
    signup,
    getToken,
    getUserMetadata: getToken,
    forgotPassword,
    resetPassword,
    validateResetToken
  };
};

exports.dbAuth = dbAuth;