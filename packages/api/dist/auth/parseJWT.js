"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.parseJWT = void 0;

const appMetadata = token => {
  const claim = token.namespace ? `${token.namespace}/app_metadata` : 'app_metadata';
  return token.decoded?.[claim] || {};
};

const roles = token => {
  const metadata = appMetadata(token);
  return token.decoded?.roles || metadata?.roles || metadata.authorization?.roles || [];
};

const parseJWT = token => {
  return {
    appMetadata: appMetadata(token),
    roles: roles(token)
  };
};

exports.parseJWT = parseJWT;