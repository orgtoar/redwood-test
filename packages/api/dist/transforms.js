"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeRequest = normalizeRequest;
exports.parseEventBody = void 0;

var _crossUndiciFetch = require("cross-undici-fetch");

/**
 * Extracts and parses body payload from event with base64 encoding check
 */
const parseEventBody = event => {
  if (!event.body) {
    return;
  }

  if (event.isBase64Encoded) {
    return JSON.parse(Buffer.from(event.body, 'base64').toString('utf-8'));
  } else {
    return JSON.parse(event.body);
  }
};

exports.parseEventBody = parseEventBody;

function normalizeRequest(event) {
  const body = parseEventBody(event);
  return {
    headers: new _crossUndiciFetch.Headers(event.headers),
    method: event.httpMethod,
    query: event.queryStringParameters,
    body
  };
}