"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.nhost = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

const nhost = async token => {
  const CLAIMS_NAMESPACE = process.env.NHOST_CLAIMS_NAMESPACE || 'https://hasura.io/jwt/claims';
  const ROLES_CLAIM = process.env.NHOST_ROLES_CLAIM || 'x-hasura-allowed-roles';

  if (!process.env.NHOST_JWT_SECRET) {
    console.error('NHOST_JWT_SECRET env var is not set.');
    throw new Error('NHOST_JWT_SECRET env var is not set.');
  }

  try {
    const secret = process.env.NHOST_JWT_SECRET;
    const decoded = await _jsonwebtoken.default.verify(token, secret);
    const claims = decoded[CLAIMS_NAMESPACE];
    const roles = claims[ROLES_CLAIM];
    return { ...decoded,
      roles
    };
  } catch (error) {
    throw new Error(error);
  }
};

exports.nhost = nhost;