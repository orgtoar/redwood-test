"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webAuthnSession = exports.getSession = exports.extractCookie = exports.decryptSession = exports.dbAuthSession = void 0;

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

var DbAuthError = _interopRequireWildcard(require("./errors"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Extracts the cookie from an event, handling lower and upper case header
// names.
// Checks for cookie in headers in dev when user has generated graphiql headers
const extractCookie = event => {
  let cookieFromGraphiqlHeader;

  if (process.env.NODE_ENV === 'development') {
    try {
      var _JSON$parse$extension, _JSON$parse$extension2, _event$body;

      cookieFromGraphiqlHeader = (_JSON$parse$extension = JSON.parse((_event$body = event.body) !== null && _event$body !== void 0 ? _event$body : '{}').extensions) === null || _JSON$parse$extension === void 0 ? void 0 : (_JSON$parse$extension2 = _JSON$parse$extension.headers) === null || _JSON$parse$extension2 === void 0 ? void 0 : _JSON$parse$extension2.cookie;
    } catch (e) {
      return event.headers.cookie || event.headers.Cookie;
    }
  }

  return event.headers.cookie || event.headers.Cookie || cookieFromGraphiqlHeader;
}; // decrypts the session cookie and returns an array: [data, csrf]


exports.extractCookie = extractCookie;

const decryptSession = text => {
  if (!text || text.trim() === '') {
    return [];
  }

  try {
    const decoded = _cryptoJs.default.AES.decrypt(text, process.env.SESSION_SECRET).toString(_cryptoJs.default.enc.Utf8);

    const [data, csrf] = decoded.split(';');
    const json = JSON.parse(data);
    return [json, csrf];
  } catch (e) {
    throw new DbAuthError.SessionDecryptionError();
  }
}; // returns the actual value of the session cookie


exports.decryptSession = decryptSession;

const getSession = text => {
  if (typeof text === 'undefined' || text === null) {
    return null;
  }

  const cookies = text.split(';');
  const sessionCookie = cookies.find(cook => {
    return cook.split('=')[0].trim() === 'session';
  });

  if (!sessionCookie || sessionCookie === 'session=') {
    return null;
  }

  return sessionCookie.split('=')[1].trim();
}; // Convenience function to get session, decrypt, and return session data all
// at once. Accepts the `event` argument from a Lambda function call.


exports.getSession = getSession;

const dbAuthSession = event => {
  if (extractCookie(event)) {
    const [session, _csrfToken] = decryptSession(getSession(extractCookie(event)));
    return session;
  } else {
    return null;
  }
};

exports.dbAuthSession = dbAuthSession;

const webAuthnSession = event => {
  if (!event.headers.cookie) {
    return null;
  }

  const webAuthnCookie = event.headers.cookie.split(';').find(cook => {
    return cook.split('=')[0].trim() === 'webAuthn';
  });

  if (!webAuthnCookie || webAuthnCookie === 'webAuthn=') {
    return null;
  }

  return webAuthnCookie.split('=')[1].trim();
};

exports.webAuthnSession = webAuthnSession;