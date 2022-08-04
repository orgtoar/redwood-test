"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.supabase = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

const supabase = token => {
  if (!process.env.SUPABASE_JWT_SECRET) {
    console.error('SUPABASE_JWT_SECRET env var is not set.');
    throw new Error('SUPABASE_JWT_SECRET env var is not set.');
  }

  try {
    const secret = process.env.SUPABASE_JWT_SECRET;
    return Promise.resolve(_jsonwebtoken.default.verify(token, secret));
  } catch (error) {
    return Promise.reject(error);
  }
};

exports.supabase = supabase;