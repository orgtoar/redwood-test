"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.typesToClients = void 0;

var _auth = require("./auth0");

var _azureActiveDirectory = require("./azureActiveDirectory");

var _clerk = require("./clerk");

var _custom = require("./custom");

var _dbAuth = require("./dbAuth");

var _ethereum = require("./ethereum");

var _firebase = require("./firebase");

var _goTrue = require("./goTrue");

var _magicLink = require("./magicLink");

var _netlify = require("./netlify");

var _nhost = require("./nhost");

var _okta = require("./okta");

var _supabase = require("./supabase");

var _supertokens = require("./supertokens");

const typesToClients = {
  netlify: _netlify.netlify,
  auth0: _auth.auth0,
  azureActiveDirectory: _azureActiveDirectory.azureActiveDirectory,
  dbAuth: _dbAuth.dbAuth,
  goTrue: _goTrue.goTrue,
  magicLink: _magicLink.magicLink,
  firebase: _firebase.firebase,
  supabase: _supabase.supabase,
  ethereum: _ethereum.ethereum,
  nhost: _nhost.nhost,
  clerk: _clerk.clerk,
  supertokens: _supertokens.supertokens,
  okta: _okta.okta,

  /** Don't we support your auth client? No problem, define your own the `custom` type! */
  custom: _custom.custom
};
exports.typesToClients = typesToClients;