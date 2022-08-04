"use strict";

var _context;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _exportNames = {
  getAuthProviderHeader: true,
  parseAuthorizationHeader: true,
  getAuthenticationContext: true
};
exports.parseAuthorizationHeader = exports.getAuthenticationContext = exports.getAuthProviderHeader = void 0;

var _parseJWT = require("./parseJWT");

_forEachInstanceProperty(_context = _Object$keys(_parseJWT)).call(_context, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _parseJWT[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _parseJWT[key];
    }
  });
});

var _decoders = require("./decoders");

// This is shared by `@redwoodjs/web`
const AUTH_PROVIDER_HEADER = 'auth-provider';

const getAuthProviderHeader = event => {
  return event === null || event === void 0 ? void 0 : event.headers[AUTH_PROVIDER_HEADER];
};

exports.getAuthProviderHeader = getAuthProviderHeader;

/**
 * Split the `Authorization` header into a schema and token part.
 */
const parseAuthorizationHeader = event => {
  var _ref, _event$headers, _event$headers2;

  const parts = (_ref = ((_event$headers = event.headers) === null || _event$headers === void 0 ? void 0 : _event$headers.authorization) || ((_event$headers2 = event.headers) === null || _event$headers2 === void 0 ? void 0 : _event$headers2.Authorization)) === null || _ref === void 0 ? void 0 : _ref.split(' ');

  if ((parts === null || parts === void 0 ? void 0 : parts.length) !== 2) {
    throw new Error('The `Authorization` header is not valid.');
  }

  const [schema, token] = parts;

  if (!schema.length || !token.length) {
    throw new Error('The `Authorization` header is not valid.');
  }

  return {
    schema,
    token
  };
};

exports.parseAuthorizationHeader = parseAuthorizationHeader;

/**
 * Get the authorization information from the request headers and request context.
 * @returns [decoded, { type, schema, token }, { event, context }]
 **/
const getAuthenticationContext = async ({
  event,
  context
}) => {
  const type = getAuthProviderHeader(event); // No `auth-provider` header means that the user is logged out,
  // and none of this auth malarky is required.

  if (!type) {
    return undefined;
  }

  let decoded = null;
  const {
    schema,
    token
  } = parseAuthorizationHeader(event);
  decoded = await (0, _decoders.decodeToken)(type, token, {
    event,
    context
  });
  return [decoded, {
    type,
    schema,
    token
  }, {
    event,
    context
  }];
};

exports.getAuthenticationContext = getAuthenticationContext;