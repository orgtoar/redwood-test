"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.ethereum = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

const ethereum = token => {
  if (!process.env.ETHEREUM_JWT_SECRET) {
    console.error('ETHEREUM_JWT_SECRET env var is not set.');
    throw new Error('ETHEREUM_JWT_SECRET env var is not set.');
  }

  try {
    const secret = process.env.ETHEREUM_JWT_SECRET;
    return _promise.default.resolve(_jsonwebtoken.default.verify(token, secret));
  } catch (error) {
    return _promise.default.reject(error);
  }
};

exports.ethereum = ethereum;