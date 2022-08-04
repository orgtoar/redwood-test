"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RedwoodError = void 0;

class RedwoodError extends Error {
  constructor(message, extensions) {
    super(message);
    this.extensions = void 0;
    this.name = 'RedwoodError';
    this.extensions = extensions;
  }

}

exports.RedwoodError = RedwoodError;