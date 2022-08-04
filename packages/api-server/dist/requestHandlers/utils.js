"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseBody = exports.mergeMultiValueHeaders = void 0;

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

const parseBody = rawBody => {
  if (typeof rawBody === 'string') {
    return {
      body: rawBody,
      isBase64Encoded: false
    };
  }

  if (rawBody instanceof Buffer) {
    return {
      body: rawBody.toString('base64'),
      isBase64Encoded: true
    };
  }

  return {
    body: '',
    isBase64Encoded: false
  };
};
/**
 * In case there are multi-value headers that are not in the headers object,
 * we need to add them to the headers object and ensure the header names are lowercase
 * and there are multiple headers with the same name for each value.
 */


exports.parseBody = parseBody;

const mergeMultiValueHeaders = (headers, multiValueHeaders) => {
  const mergedHeaders = headers || {};

  if (multiValueHeaders) {
    Object.keys(multiValueHeaders).forEach(headerName => {
      const headerValue = multiValueHeaders[headerName];
      mergedHeaders[headerName.toLowerCase()] = headerValue.join('; ');
    });
  }

  return mergedHeaders;
};

exports.mergeMultiValueHeaders = mergeMultiValueHeaders;