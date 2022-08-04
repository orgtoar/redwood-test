"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.okta = void 0;

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
  return new Promise(resolve => {
    client.verifyAccessToken(token, OKTA_AUDIENCE).then(res => {
      resolve(res.claims);
    }).catch(err => console.warn('Token failed validation: ' + err));
  });
};

exports.okta = okta;