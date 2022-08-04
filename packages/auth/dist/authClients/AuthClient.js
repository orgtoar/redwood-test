"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.createAuthClient = void 0;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _SupportedAuthClients = require("./SupportedAuthClients");

const createAuthClient = (client, type, config) => {
  if (!_SupportedAuthClients.typesToClients[type]) {
    var _context;

    const supportedClients = (0, _keys.default)(_SupportedAuthClients.typesToClients).join(', ');
    throw new Error((0, _concat.default)(_context = "Your client ".concat(type, " is not supported, we only support ")).call(_context, supportedClients));
  }

  return _promise.default.resolve(_SupportedAuthClients.typesToClients[type](client, config));
};

exports.createAuthClient = createAuthClient;