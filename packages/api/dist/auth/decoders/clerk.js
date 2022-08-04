"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clerk = void 0;

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
    var _user$publicMetadata$;

    const jwtPayload = await base.verifySessionToken(token);

    if (!jwtPayload.sub) {
      return Promise.reject(new Error('Session invalid'));
    }

    const user = await users.getUser(jwtPayload.sub);
    return { ...user,
      roles: (_user$publicMetadata$ = user.publicMetadata['roles']) !== null && _user$publicMetadata$ !== void 0 ? _user$publicMetadata$ : []
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

exports.clerk = clerk;