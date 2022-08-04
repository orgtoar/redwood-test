"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.decodeToken = void 0;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _auth = require("./auth0");

var _azureActiveDirectory = require("./azureActiveDirectory");

var _clerk = require("./clerk");

var _custom = require("./custom");

var _dbAuth = require("./dbAuth");

var _ethereum = require("./ethereum");

var _firebase = require("./firebase");

var _magicLink = require("./magicLink");

var _netlify = require("./netlify");

var _nhost = require("./nhost");

var _okta = require("./okta");

var _supabase = require("./supabase");

var _supertokens = require("./supertokens");

const typesToDecoders = {
  auth0: _auth.auth0,
  azureActiveDirectory: _azureActiveDirectory.azureActiveDirectory,
  clerk: _clerk.clerk,
  netlify: _netlify.netlify,
  nhost: _nhost.nhost,
  goTrue: _netlify.netlify,
  magicLink: _magicLink.magicLink,
  firebase: _firebase.firebase,
  supabase: _supabase.supabase,
  ethereum: _ethereum.ethereum,
  dbAuth: _dbAuth.dbAuth,
  supertokens: _supertokens.supertokens,
  okta: _okta.okta,
  custom: _custom.custom
};

const decodeToken = async (type, token, req) => {
  if (!typesToDecoders[type]) {
    // Make this a warning, instead of a hard error
    // Allow users to have multiple custom types if they choose to
    if (process.env.NODE_ENV === 'development') {
      console.warn(`The auth type "${type}" is not officially supported, we currently support: ${(0, _keys.default)(typesToDecoders).join(', ')}`);
      console.warn('Please ensure you have handlers for your custom auth in getCurrentUser in src/lib/auth.{js,ts}');
    }
  } // If the auth provider is unknown, it is the developer's
  // responsibility to use other values passed to
  // getCurrentUser such as token or header parameters to authenticate


  const decoder = typesToDecoders[type] || _custom.custom;
  const decodedToken = decoder(token, req);
  return decodedToken;
};

exports.decodeToken = decodeToken;