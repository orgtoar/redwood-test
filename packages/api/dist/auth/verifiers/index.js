"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  createVerifier: true
};
exports.createVerifier = void 0;

var _common = require("./common");

Object.keys(_common).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _common[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _common[key];
    }
  });
});

/**
 * @param {SupportedVerifierTypes} type - What verification type methods used to sign and verify signatures
 * @param {VerifyOptions} options - Options used to verify the signature based on verifiers requirements
 */
const createVerifier = (type, options) => {
  if (options) {
    return _common.verifierLookup[type](options);
  } else {
    return _common.verifierLookup[type]();
  }
};

exports.createVerifier = createVerifier;