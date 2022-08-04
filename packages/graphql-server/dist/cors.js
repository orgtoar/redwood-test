"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapRwCorsOptionsToYoga = void 0;

const mapRwCorsOptionsToYoga = (rwCorsConfig, requestOrigin) => {
  const yogaCORSOptions = {};

  if (!rwCorsConfig) {
    // Disable all CORS headers on Yoga
    return false;
  }

  if (rwCorsConfig !== null && rwCorsConfig !== void 0 && rwCorsConfig.methods) {
    if (typeof rwCorsConfig.methods === 'string') {
      yogaCORSOptions.methods = [rwCorsConfig.methods];
    } else if (Array.isArray(rwCorsConfig.methods)) {
      yogaCORSOptions.methods = rwCorsConfig.methods;
    }
  }

  if (rwCorsConfig !== null && rwCorsConfig !== void 0 && rwCorsConfig.allowedHeaders) {
    if (typeof rwCorsConfig.allowedHeaders === 'string') {
      yogaCORSOptions.allowedHeaders = [rwCorsConfig.allowedHeaders];
    } else if (Array.isArray(rwCorsConfig.allowedHeaders)) {
      yogaCORSOptions.allowedHeaders = rwCorsConfig.allowedHeaders;
    }
  }

  if (rwCorsConfig !== null && rwCorsConfig !== void 0 && rwCorsConfig.exposedHeaders) {
    if (typeof rwCorsConfig.exposedHeaders === 'string') {
      yogaCORSOptions.exposedHeaders = [rwCorsConfig.exposedHeaders];
    } else if (Array.isArray(rwCorsConfig.exposedHeaders)) {
      yogaCORSOptions.exposedHeaders = rwCorsConfig.exposedHeaders;
    }
  }

  if (rwCorsConfig !== null && rwCorsConfig !== void 0 && rwCorsConfig.credentials) {
    yogaCORSOptions.credentials = rwCorsConfig.credentials;
  }

  if (rwCorsConfig !== null && rwCorsConfig !== void 0 && rwCorsConfig.maxAge) {
    yogaCORSOptions.maxAge = rwCorsConfig.maxAge;
  }

  if (rwCorsConfig !== null && rwCorsConfig !== void 0 && rwCorsConfig.origin) {
    if (typeof rwCorsConfig.origin === 'string') {
      yogaCORSOptions.origin = [rwCorsConfig.origin];
    } else if (rwCorsConfig.origin === true) {
      yogaCORSOptions.origin = [requestOrigin || '*'];
    } else {
      // Array of origins
      yogaCORSOptions.origin = rwCorsConfig.origin;
    }
  }

  return yogaCORSOptions;
};

exports.mapRwCorsOptionsToYoga = mapRwCorsOptionsToYoga;