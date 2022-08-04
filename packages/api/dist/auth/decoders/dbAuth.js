"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dbAuth = void 0;

var _shared = require("../../functions/dbAuth/shared");

const dbAuth = (authHeaderValue, req) => {
  const session = (0, _shared.dbAuthSession)(req.event);
  const authHeaderUserId = authHeaderValue;

  if (session.id.toString() !== authHeaderUserId) {
    throw new Error('Authorization header does not match decrypted user ID');
  }

  return session;
};

exports.dbAuth = dbAuth;