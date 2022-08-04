"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.parseBody = exports.mergeMultiValueHeaders = void 0;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

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
    var _context;

    (0, _forEach.default)(_context = (0, _keys.default)(multiValueHeaders)).call(_context, headerName => {
      const headerValue = multiValueHeaders[headerName];
      mergedHeaders[headerName.toLowerCase()] = headerValue.join('; ');
    });
  }

  return mergedHeaders;
};

exports.mergeMultiValueHeaders = mergeMultiValueHeaders;