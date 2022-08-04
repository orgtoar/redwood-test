"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DEFAULT_WEBHOOK_SECRET", {
  enumerable: true,
  get: function () {
    return _verifiers.DEFAULT_WEBHOOK_SECRET;
  }
});
exports.DEFAULT_WEBHOOK_SIGNATURE_HEADER = void 0;
Object.defineProperty(exports, "SupportedVerifierTypes", {
  enumerable: true,
  get: function () {
    return _verifiers.SupportedVerifierTypes;
  }
});
Object.defineProperty(exports, "VerifyOptions", {
  enumerable: true,
  get: function () {
    return _verifiers.VerifyOptions;
  }
});
Object.defineProperty(exports, "WebhookVerificationError", {
  enumerable: true,
  get: function () {
    return _verifiers.WebhookVerificationError;
  }
});
exports.verifySignature = exports.verifyEvent = exports.signatureFromEvent = exports.signPayload = void 0;

var _verifiers = require("../auth/verifiers");

const DEFAULT_WEBHOOK_SIGNATURE_HEADER = 'RW-WEBHOOK-SIGNATURE';
/**
 * Extracts body payload from event with base64 encoding check
 *
 */

exports.DEFAULT_WEBHOOK_SIGNATURE_HEADER = DEFAULT_WEBHOOK_SIGNATURE_HEADER;

const eventBody = event => {
  if (event.isBase64Encoded) {
    return Buffer.from(event.body || '', 'base64').toString('utf-8');
  } else {
    return event.body || '';
  }
};
/**
 * Extracts signature from Lambda Event.
 *
 * @param {APIGatewayProxyEvent} event - The event that incudes the request details, like headers
 * @param {string} signatureHeader - The name of header key that contains the signature; defaults to DEFAULT_WEBHOOK_SIGNATURE_HEADER
 * @return {string} - The signature found in the headers specified by signatureHeader
 *
 * @example
 *
 *    signatureFromEvent({ event: event })
 */


const signatureFromEvent = ({
  event,
  signatureHeader = DEFAULT_WEBHOOK_SIGNATURE_HEADER
}) => {
  const header = signatureHeader.toLocaleLowerCase();
  return event.headers[header];
};
/**
 * Verifies event payload is signed with a valid webhook signature.
 *
 * @param {APIGatewayProxyEvent} event - The event that includes the body for the verification payload and request details, like headers.
 * @param {string} payload - If provided, the payload will be used to verify the signature instead of the event body.
 * @param {string} secret - The secret that will verify the signature according to the verifier type
 * @param {VerifyOptions} options - Options to specify the verifier type the header key that contains the signature, timestamp leeway.
 * @return {boolean | WebhookVerificationError} - Returns true if the signature is verified, or raises WebhookVerificationError.
 *
 * @example
 *
 *    verifyEvent({ event: event, options: {} })*
 */


exports.signatureFromEvent = signatureFromEvent;

const verifyEvent = (type, {
  event,
  payload,
  secret = _verifiers.DEFAULT_WEBHOOK_SECRET,
  options
}) => {
  let body = '';

  if (payload) {
    body = payload;
  } else {
    body = eventBody(event);
  }

  let signature = signatureFromEvent({
    event,
    signatureHeader: (options === null || options === void 0 ? void 0 : options.signatureHeader) || DEFAULT_WEBHOOK_SIGNATURE_HEADER
  });

  if (options !== null && options !== void 0 && options.signatureTransformer) {
    signature = options.signatureTransformer(signature);
  }

  if (options !== null && options !== void 0 && options.eventTimestamp) {
    var _options$currentTimes, _options$tolerance;

    const timestamp = (_options$currentTimes = options === null || options === void 0 ? void 0 : options.currentTimestampOverride) !== null && _options$currentTimes !== void 0 ? _options$currentTimes : Date.now();
    const difference = Math.abs(timestamp - (options === null || options === void 0 ? void 0 : options.eventTimestamp));
    const tolerance = (_options$tolerance = options === null || options === void 0 ? void 0 : options.tolerance) !== null && _options$tolerance !== void 0 ? _options$tolerance : _verifiers.DEFAULT_TOLERANCE;

    if (difference > tolerance) {
      throw new _verifiers.WebhookVerificationError();
    }
  }

  const {
    verify
  } = (0, _verifiers.createVerifier)(type, options);
  return verify({
    payload: body,
    secret,
    signature
  });
};
/**
 * Standalone verification of webhook signature given a payload, secret, verifier type and options.
 *
 * @param {string} payload - Body content of the event
 * @param {string} secret - The secret that will verify the signature according to the verifier type
 * @param {string} signature - Signature that verifies that the event
 * @param {VerifyOptions} options - Options to specify the verifier type the header key that contains the signature, timestamp leeway.
 * @return {boolean | WebhookVerificationError} - Returns true if the signature is verified, or raises WebhookVerificationError.
 *
 * @example
 *
 *    verifySignature({ payload, secret, signature, options: {} })*
 */


exports.verifyEvent = verifyEvent;

const verifySignature = (type, {
  payload,
  secret = _verifiers.DEFAULT_WEBHOOK_SECRET,
  signature,
  options
}) => {
  const {
    verify
  } = (0, _verifiers.createVerifier)(type, options);
  return verify({
    payload,
    secret,
    signature
  });
};
/**
 * Signs a payload with a secret and verifier type method
 *
 * @param {string} payload - Body content of the event to sign
 * @param {string} secret - The secret that will verify the signature according to the verifier type
 * @param {VerifyOptions} options - Options to specify the verifier type the header key that contains the signature, timestamp leeway.
 * @return {string} - Returns signature
 *
 * @example
 *
 *    signPayload({ payload, secret, options: {} })*
 */


exports.verifySignature = verifySignature;

const signPayload = (type, {
  payload,
  secret = _verifiers.DEFAULT_WEBHOOK_SECRET,
  options
}) => {
  const {
    sign
  } = (0, _verifiers.createVerifier)(type, options);
  return sign({
    payload,
    secret
  });
};

exports.signPayload = signPayload;