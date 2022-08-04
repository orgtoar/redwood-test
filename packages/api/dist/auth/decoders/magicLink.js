"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.magicLink = void 0;

const magicLink = async token => {
  const {
    MAGIC_SECRET_API_KEY
  } = process.env;

  if (!MAGIC_SECRET_API_KEY) {
    throw new Error('`MAGIC_SECRET_API_KEY` environment variable not set.');
  }

  const {
    Magic
  } = require('@magic-sdk/admin');

  const magicAdmin = new Magic(MAGIC_SECRET_API_KEY);
  await magicAdmin.token.validate(token);
  const parsedDIDToken = magicAdmin.token.decode(token); // https://magic.link/docs/introduction/decentralized-id#what-is-a-did-token
  // The DID token is encoded as a Base64 JSON string tuple representing [proof, claim]:
  // proof: A digital signature that proves the validity of the given claim.
  // claim: Unsigned data the user asserts. This should equal the proof after Elliptic Curve recovery.
  //
  // import type { Claim } from '@magic-sdk/admin'
  // interface Claim {
  //   iat: number; // Issued At Timestamp
  //   ext: number; // Expiration Timestamp
  //   iss: string; // Issuer of DID Token
  //   sub: string; // Subject
  //   aud: string; // Audience
  //   nbf: number; // Not Before Timestamp
  //   tid: string; // DID Token ID
  //   add: string; // Encrypted signature of arbitrary data
  // }

  return {
    proof: parsedDIDToken[0],
    // proof: String
    claim: parsedDIDToken[1] // claim: Claim

  };
};

exports.magicLink = magicLink;