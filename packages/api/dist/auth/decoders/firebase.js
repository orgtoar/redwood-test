"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.firebase = void 0;

const firebase = async token => {
  // Use require here to prevent dependency for non-firebase projects
  const admin = require('firebase-admin');

  return admin.auth().verifyIdToken(token); // Alternative third-party JWT verification process described here:
  // https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
};

exports.firebase = firebase;