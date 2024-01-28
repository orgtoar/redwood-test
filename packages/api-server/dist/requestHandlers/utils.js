"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.parseBody = exports.mergeMultiValueHeaders = void 0;
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
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
 * `headers` and `multiValueHeaders` are merged into a single object where the
 * key is the header name in lower-case and the value is a list of values for
 * that header. Most multi-values are merged into a single value separated by a
 * semi-colon. The only exception is set-cookie. set-cookie headers should not
 * be merged, they should be set individually by multiple calls to
 * reply.header(). See
 * https://www.fastify.io/docs/latest/Reference/Reply/#set-cookie
 */
exports.parseBody = parseBody;
const mergeMultiValueHeaders = (headers, multiValueHeaders) => {
  var _context, _context2;
  const mergedHeaders = (0, _reduce.default)(_context = (0, _entries.default)(headers || {})).call(_context, (acc, [name, value]) => {
    acc[name.toLowerCase()] = [value];
    return acc;
  }, {});
  (0, _forEach.default)(_context2 = (0, _entries.default)(multiValueHeaders || {})).call(_context2, ([headerName, values]) => {
    const name = headerName.toLowerCase();
    if (name.toLowerCase() === 'set-cookie') {
      mergedHeaders['set-cookie'] = values;
    } else {
      mergedHeaders[name] = [values.join('; ')];
    }
  });
  return mergedHeaders;
};
exports.mergeMultiValueHeaders = mergeMultiValueHeaders;