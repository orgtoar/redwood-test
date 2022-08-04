"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCorsContext = createCorsContext;

var _crossUndiciFetch = require("cross-undici-fetch");

function createCorsContext(cors) {
  // Taken from apollo-server-env
  // @see: https://github.com/apollographql/apollo-server/blob/9267a79b974e397e87ad9ee408b65c46751e4565/packages/apollo-server-env/src/polyfills/fetch.js#L1
  const corsHeaders = new _crossUndiciFetch.Headers();

  if (cors) {
    if (cors.methods) {
      if (typeof cors.methods === 'string') {
        corsHeaders.set('access-control-allow-methods', cors.methods);
      } else if (Array.isArray(cors.methods)) {
        corsHeaders.set('access-control-allow-methods', cors.methods.join(','));
      }
    }

    if (cors.allowedHeaders) {
      if (typeof cors.allowedHeaders === 'string') {
        corsHeaders.set('access-control-allow-headers', cors.allowedHeaders);
      } else if (Array.isArray(cors.allowedHeaders)) {
        corsHeaders.set('access-control-allow-headers', cors.allowedHeaders.join(','));
      }
    }

    if (cors.exposedHeaders) {
      if (typeof cors.exposedHeaders === 'string') {
        corsHeaders.set('access-control-expose-headers', cors.exposedHeaders);
      } else if (Array.isArray(cors.exposedHeaders)) {
        corsHeaders.set('access-control-expose-headers', cors.exposedHeaders.join(','));
      }
    }

    if (cors.credentials) {
      corsHeaders.set('access-control-allow-credentials', 'true');
    }

    if (typeof cors.maxAge === 'number') {
      corsHeaders.set('access-control-max-age', cors.maxAge.toString());
    }
  }

  return {
    shouldHandleCors(request) {
      return request.method === 'OPTIONS';
    },

    getRequestHeaders(request) {
      const eventHeaders = new _crossUndiciFetch.Headers(request.headers);
      const requestCorsHeaders = new _crossUndiciFetch.Headers(corsHeaders);

      if (cors && cors.origin) {
        const requestOrigin = eventHeaders.get('origin');

        if (typeof cors.origin === 'string') {
          requestCorsHeaders.set('access-control-allow-origin', cors.origin);
        } else if (requestOrigin && (typeof cors.origin === 'boolean' || Array.isArray(cors.origin) && requestOrigin && cors.origin.includes(requestOrigin))) {
          requestCorsHeaders.set('access-control-allow-origin', requestOrigin);
        }

        const requestAccessControlRequestHeaders = eventHeaders.get('access-control-request-headers');

        if (!cors.allowedHeaders && requestAccessControlRequestHeaders) {
          requestCorsHeaders.set('access-control-allow-headers', requestAccessControlRequestHeaders);
        }
      }

      return Object.fromEntries(requestCorsHeaders.entries());
    }

  };
}