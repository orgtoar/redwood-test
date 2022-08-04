"use strict";

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  prismaVersion: true,
  redwoodVersion: true,
  dbAuthSession: true
};
Object.defineProperty(exports, "dbAuthSession", {
  enumerable: true,
  get: function () {
    return _shared.dbAuthSession;
  }
});
exports.redwoodVersion = exports.prismaVersion = void 0;

var _auth = require("./auth");

Object.keys(_auth).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _auth[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _auth[key];
    }
  });
});

var _errors = require("./errors");

Object.keys(_errors).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _errors[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _errors[key];
    }
  });
});

var _DbAuthHandler = require("./functions/dbAuth/DbAuthHandler");

Object.keys(_DbAuthHandler).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _DbAuthHandler[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _DbAuthHandler[key];
    }
  });
});

var _shared = require("./functions/dbAuth/shared");

var _validations = require("./validations/validations");

Object.keys(_validations).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _validations[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _validations[key];
    }
  });
});

var _errors2 = require("./validations/errors");

Object.keys(_errors2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _errors2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _errors2[key];
    }
  });
});

var _transforms = require("./transforms");

Object.keys(_transforms).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _transforms[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _transforms[key];
    }
  });
});

var _cors = require("./cors");

Object.keys(_cors).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _cors[key]) return;
  Object.defineProperty(exports, key, {
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