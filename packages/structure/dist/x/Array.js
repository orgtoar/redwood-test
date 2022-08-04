"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArrayLike_normalize = ArrayLike_normalize;
exports.iter = iter;

async function ArrayLike_normalize(x) {
  if (x instanceof Promise) {
    return x;
  }

  if (x === null) {
    return [];
  }

  if (typeof x === 'undefined') {
    return [];
  }

  return [...x];
}

function iter(f) {
  return Array.from(f());
}