"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.okta = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

const okta = async token => {
  const {
    OKTA_DOMAIN,
    OKTA_AUDIENCE
  } = process.env;

  if (!OKTA_AUDIENCE || !OKTA_DOMAIN) {
    throw new Error('`OKTA_DOMAIN` or `OKTA_AUDIENCE` env vars are not set.');
  }

  const OktaJwtVerifier = require('@okta/jwt-verifier');

  const client = new OktaJwtVerifier({
    issuer: `https://${OKTA_DOMAIN}/oauth2/default`
  });
  return new _promise.default(resolve => {
    client.verifyAccessToken(token, OKTA_AUDIENCE).then(res => {
      resolve(res.claims);
    }).catch(err => console.warn('Token failed validation: ' + err));
  });
};

exports.okta = okta;