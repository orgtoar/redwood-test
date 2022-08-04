"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyAuth0Token = exports.auth0 = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _jwksRsa = _interopRequireDefault(require("jwks-rsa"));

/**
 * This takes an auth0 jwt and verifies it. It returns something like this:
 * ```js
 * {
 *   iss: 'https://<AUTH0_DOMAIN>/',
 *   sub: 'auth0|xxx',
 *   aud: [ 'api.billable', 'https://<AUTH0_DOMAIN>/userinfo' ],
 *   iat: 1588800141,
 *   exp: 1588886541,
 *   azp: 'QOsYIlHvCLqLzmfDU0Z3upFdu1znlkqK',
 *   scope: 'openid profile email'
 * }
 * ```
 *
 * You can use `sub` as a stable reference to your user, but  if you want the email
 * addres you can set a context object[^0] in rules[^1]:
 *
 * ^0: https://auth0.com/docs/rules/references/context-object
 * ^1: https://manage.auth0.com/#/rules/new
 *
 */
const verifyAuth0Token = bearerToken => {
  return new Promise((resolve, reject) => {
    const {
      AUTH0_DOMAIN,
      AUTH0_AUDIENCE
    } = process.env;

    if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
      throw new Error('`AUTH0_DOMAIN` or `AUTH0_AUDIENCE` env vars are not set.');
    }

    const client = (0, _jwksRsa.default)({
      jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
    });

    _jsonwebtoken.default.verify(bearerToken, (header, callback) => {
      client.getSigningKey(header.kid, (error, key) => {
        callback(error, key === null || key === void 0 ? void 0 : key.getPublicKey());
      });
    }, {
      audience: AUTH0_AUDIENCE,
      issuer: `https://${AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    }, (verifyError, decoded) => {
      if (verifyError) {
        return reject(verifyError);
      }

      resolve(typeof decoded === 'undefined' ? null : decoded);
    });
  });
};

exports.verifyAuth0Token = verifyAuth0Token;

const auth0 = async token => {
  return verifyAuth0Token(token);
};

exports.auth0 = auth0;