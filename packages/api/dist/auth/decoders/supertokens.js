"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.supertokens = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _jwksRsa = _interopRequireDefault(require("jwks-rsa"));

const supertokens = async token => {
  return new _promise.default((resolve, reject) => {
    const {
      SUPERTOKENS_JWKS_URL
    } = process.env;

    if (SUPERTOKENS_JWKS_URL === undefined) {
      return reject(new Error('SUPERTOKENS_JWKS_URL environment variable is not set'));
    }

    const client = (0, _jwksRsa.default)({
      jwksUri: SUPERTOKENS_JWKS_URL
    });

    function getKey(header, callback) {
      client.getSigningKey(header.kid, function (err, key) {
        const signingKey = key.getPublicKey();
        callback(err, signingKey);
      });
    }

    _jsonwebtoken.default.verify(token, getKey, {}, function (err, decoded) {
      if (err) {
        return reject(err);
      }

      decoded = decoded === null ? {} : decoded;
      return resolve(decoded);
    });
  });
};

exports.supertokens = supertokens;