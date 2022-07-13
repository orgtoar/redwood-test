"use strict";

var _context, _context2, _context3, _context4, _context5, _context6, _context7;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _exportNames = {
  prismaVersion: true,
  redwoodVersion: true,
  dbAuthSession: true
};

_Object$defineProperty(exports, "dbAuthSession", {
  enumerable: true,
  get: function () {
    return _shared.dbAuthSession;
  }
});

exports.redwoodVersion = exports.prismaVersion = void 0;

var _auth = require("./auth");

_forEachInstanceProperty(_context = _Object$keys(_auth)).call(_context, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _auth[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _auth[key];
    }
  });
});

var _errors = require("./errors");

_forEachInstanceProperty(_context2 = _Object$keys(_errors)).call(_context2, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _errors[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _errors[key];
    }
  });
});

var _DbAuthHandler = require("./functions/dbAuth/DbAuthHandler");

_forEachInstanceProperty(_context3 = _Object$keys(_DbAuthHandler)).call(_context3, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _DbAuthHandler[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _DbAuthHandler[key];
    }
  });
});

var _shared = require("./functions/dbAuth/shared");

var _validations = require("./validations/validations");

_forEachInstanceProperty(_context4 = _Object$keys(_validations)).call(_context4, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _validations[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _validations[key];
    }
  });
});

var _errors2 = require("./validations/errors");

_forEachInstanceProperty(_context5 = _Object$keys(_errors2)).call(_context5, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _errors2[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _errors2[key];
    }
  });
});

var _transforms = require("./transforms");

_forEachInstanceProperty(_context6 = _Object$keys(_transforms)).call(_context6, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _transforms[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _transforms[key];
    }
  });
});

var _cors = require("./cors");

_forEachInstanceProperty(_context7 = _Object$keys(_cors)).call(_context7, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _cors[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _cors[key];
    }
  });
});

// @NOTE: use require, to avoid messing around with tsconfig and nested output dirs
const packageJson = require('../package.json');

const prismaVersion = packageJson === null || packageJson === void 0 ? void 0 : packageJson.dependencies['@prisma/client'];
exports.prismaVersion = prismaVersion;
const redwoodVersion = packageJson === null || packageJson === void 0 ? void 0 : packageJson.version;
exports.redwoodVersion = redwoodVersion;