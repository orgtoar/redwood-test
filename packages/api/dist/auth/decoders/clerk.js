"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.clerk = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

const clerk = async token => {
  // Use require here, to prevent needing clerk sdk in api deps
  const Clerk = require('@clerk/clerk-sdk-node/instance').default;

  const {
    users,
    base
  } = new Clerk();

  if (!process.env.CLERK_JWT_KEY) {
    console.error('CLERK_JWT_KEY env var is not set.');
    throw new Error('CLERK_JWT_KEY env var is not set.');
  }

  try {
    const jwtPayload = await base.verifySessionToken(token);

    if (!jwtPayload.sub) {
      return _promise.default.reject(new Error('Session invalid'));
    }

    const user = await users.getUser(jwtPayload.sub);
    return { ...user,
      roles: user.publicMetadata['roles'] ?? []
    };
  } catch (error) {
    return _promise.default.reject(error);
  }
};

exports.clerk = clerk;