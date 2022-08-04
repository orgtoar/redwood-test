"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RedwoodRecordUncaughtError = exports.RedwoodRecordNullAttributeError = exports.RedwoodRecordNotFoundError = exports.RedwoodRecordMissingRequiredModelError = exports.RedwoodRecordMissingAttributeError = exports.RedwoodRecordError = void 0;

var _api = require("@redwoodjs/api");

class RedwoodRecordError extends _api.RedwoodError {
  constructor() {
    super();
    this.name = 'RedwoodRecordError';
  }

}

exports.RedwoodRecordError = RedwoodRecordError;

class RedwoodRecordUncaughtError extends _api.RedwoodError {
  constructor(message) {
    super(message);
    this.name = 'RedwoodRecordUncaughtError';
  }

}

exports.RedwoodRecordUncaughtError = RedwoodRecordUncaughtError;

class RedwoodRecordNotFoundError extends _api.RedwoodError {
  constructor(name) {
    super(`${name} record not found`);
    this.name = 'RedwoodRecordNotFoundError';
  }

}

exports.RedwoodRecordNotFoundError = RedwoodRecordNotFoundError;

class RedwoodRecordNullAttributeError extends _api.RedwoodError {
  constructor(name) {
    super(`${name} must not be null`);
    this.name = 'RedwoodRecordNullAttributeError';
  }

}

exports.RedwoodRecordNullAttributeError = RedwoodRecordNullAttributeError;

class RedwoodRecordMissingAttributeError extends _api.RedwoodError {
  constructor(name) {
    super(`${name} is missing`);
    this.name = 'RedwoodRecordMissingAttributeError';
  }

}

exports.RedwoodRecordMissingAttributeError = RedwoodRecordMissingAttributeError;

class RedwoodRecordMissingRequiredModelError extends _api.RedwoodError {
  constructor(modelName, requiredModelName) {
    super(`Tried to build a relationship for ${requiredModelName} model but is not listed as a \`requiredModel\` in ${modelName}`);
    this.name = 'RedwoodRecordMissingRequiredModelError';
  }

}

exports.RedwoodRecordMissingRequiredModelError = RedwoodRecordMissingRequiredModelError;