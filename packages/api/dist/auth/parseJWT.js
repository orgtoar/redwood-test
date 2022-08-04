"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.parseJWT = void 0;

const appMetadata = token => {
  var _token$decoded;

  const claim = token.namespace ? `${token.namespace}/app_metadata` : 'app_metadata';
  return ((_token$decoded = token.decoded) === null || _token$decoded === void 0 ? void 0 : _token$decoded[claim]) || {};
};

const roles = token => {
  var _token$decoded2, _metadata$authorizati;

  const metadata = appMetadata(token);
  return ((_token$decoded2 = token.decoded) === null || _token$decoded2 === void 0 ? void 0 : _token$decoded2.roles) || (metadata === null || metadata === void 0 ? void 0 : metadata.roles) || ((_metadata$authorizati = metadata.authorization) === null || _metadata$authorizati === void 0 ? void 0 : _metadata$authorizati.roles) || [];
};

const parseJWT = token => {
  return {
    appMetadata: appMetadata(token),
    roles: roles(token)
  };
};

exports.parseJWT = parseJWT;