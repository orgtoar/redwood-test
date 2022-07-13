"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.createAuthClient = void 0;

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

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

  /** Don't we support your auth client? No problem, define your own the `custom` type! */
  custom: _custom.custom
};

const createAuthClient = (client, type, config) => {
  if (!typesToClients[type]) {
    var _context;

    throw new Error((0, _concat.default)(_context = "Your client ".concat(type, " is not supported, we only support ")).call(_context, (0, _keys.default)(typesToClients).join(', ')));
  }

  return typesToClients[type](client, config);
};

exports.createAuthClient = createAuthClient;