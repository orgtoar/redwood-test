"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAuthClient = void 0;

var _SupportedAuthClients = require("./SupportedAuthClients");

const createAuthClient = (client, type, config) => {
  if (!_SupportedAuthClients.typesToClients[type]) {
    const supportedClients = Object.keys(_SupportedAuthClients.typesToClients).join(', ');
    throw new Error("Your client ".concat(type, " is not supported, we only support ").concat(supportedClients));
  }

  return Promise.resolve(_SupportedAuthClients.typesToClients[type](client, config));
};

exports.createAuthClient = createAuthClient;