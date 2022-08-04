"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.verifierLookup = exports.WebhookVerificationError = exports.WebhookSignError = exports.VERIFICATION_SIGN_MESSAGE = exports.VERIFICATION_ERROR_MESSAGE = exports.DEFAULT_WEBHOOK_SECRET = exports.DEFAULT_TOLERANCE = void 0;

var _base64Sha1Verifier = _interopRequireDefault(require("./base64Sha1Verifier"));

var _base64Sha256Verifier = _interopRequireDefault(require("./base64Sha256Verifier"));

var _jwtVerifier = _interopRequireDefault(require("./jwtVerifier"));

var _secretKeyVerifier = _interopRequireDefault(require("./secretKeyVerifier"));

var _sha1Verifier = _interopRequireDefault(require("./sha1Verifier"));

var _sha256Verifier = _interopRequireDefault(require("./sha256Verifier"));

var _skipVerifier = _interopRequireDefault(require("./skipVerifier"));

var _timestampSchemeVerifier = _interopRequireDefault(require("./timestampSchemeVerifier"));

var _process$env$WEBHOOK_;

const verifierLookup = {
  skipVerifier: _skipVerifier.default,
  secretKeyVerifier: _secretKeyVerifier.default,
  sha1Verifier: _sha1Verifier.default,
  sha256Verifier: _sha256Verifier.default,
  base64Sha1Verifier: _base64Sha1Verifier.default,
  base64Sha256Verifier: _base64Sha256Verifier.default,
  timestampSchemeVerifier: _timestampSchemeVerifier.default,
  jwtVerifier: _jwtVerifier.default
};
exports.verifierLookup = verifierLookup;
const DEFAULT_WEBHOOK_SECRET = (_process$env$WEBHOOK_ = process.env['WEBHOOK_SECRET']) !== null && _process$env$WEBHOOK_ !== void 0 ? _process$env$WEBHOOK_ : '';
exports.DEFAULT_WEBHOOK_SECRET = DEFAULT_WEBHOOK_SECRET;
const VERIFICATION_ERROR_MESSAGE = "You don't have access to invoke this function.";
exports.VERIFICATION_ERROR_MESSAGE = VERIFICATION_ERROR_MESSAGE;
const VERIFICATION_SIGN_MESSAGE = 'Unable to sign payload';
exports.VERIFICATION_SIGN_MESSAGE = VERIFICATION_SIGN_MESSAGE;
const FIVE_MINUTES = 5 * 60_000;
/**
 * @const {number} DEFAULT_TOLERANCE - Five minutes
 */

const DEFAULT_TOLERANCE = FIVE_MINUTES;
/**
 * Class representing a WebhookError
 * @extends Error
 */

exports.DEFAULT_TOLERANCE = DEFAULT_TOLERANCE;

class WebhookError extends Error {
  /**
   * Create a WebhookError.
   * @param {string} message - The error message
   * */
  constructor(message) {
    super(message);
  }

}
/**
 * Class representing a WebhookVerificationError
 * @extends WebhookError
 */


class WebhookVerificationError extends WebhookError {
  /**
   * Create a WebhookVerificationError.
   * @param {string} message - The error message
   * */
  constructor(message) {
    super(message || VERIFICATION_ERROR_MESSAGE);
  }

}
/**
 * Class representing a WebhookSignError
 * @extends WebhookError
 */


exports.WebhookVerificationError = WebhookVerificationError;

class WebhookSignError extends WebhookError {
  /**
   * Create a WebhookSignError.
   * @param {string} message - The error message
   * */
  constructor(message) {
    super(message || VERIFICATION_SIGN_MESSAGE);
  }

}
/**
 * VerifyOptions
 *
 * Used when verifying a signature based on the verifier's requirements
 *
 * @param {string} signatureHeader - Optional Header that contains the signature
 * to verify. Will default to DEFAULT_WEBHOOK_SIGNATURE_HEADER
 * @param {(signature: string) => string} signatureTransformer - Optional
 * function that receives the signature from the headers and returns a new
 * signature to use in the Verifier
 * @param {number} currentTimestampOverride - Optional timestamp to use as the
 * "current" timestamp, in msec
 * @param {number} eventTimestamp - Optional timestamp to use as the event
 * timestamp, in msec. If this is provided the webhook verification will fail
 * if the eventTimestamp is too far from the current time (or the time passed
 * as the `currentTimestampOverride` option)
 * @param {number} tolerance - Optional tolerance in msec
 * @param {string} issuer - Options JWT issuer for JWTVerifier
 */


exports.WebhookSignError = WebhookSignError;