"use strict";

var _context, _context2, _context3, _context4, _context5, _context6, _context7;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _exportNames = {
  createValidatorDirective: true,
  createTransformerDirective: true,
  getDirectiveName: true,
  hasDirective: true,
  DirectiveParams: true,
  DirectiveType: true,
  RedwoodDirective: true,
  ValidatorDirective: true,
  ValidatorDirectiveFunc: true,
  TransformerDirective: true,
  TransformerDirectiveFunc: true,
  rootSchema: true
};

_Object$defineProperty(exports, "DirectiveParams", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.DirectiveParams;
  }
});

_Object$defineProperty(exports, "DirectiveType", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.DirectiveType;
  }
});

_Object$defineProperty(exports, "RedwoodDirective", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.RedwoodDirective;
  }
});

_Object$defineProperty(exports, "TransformerDirective", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.TransformerDirective;
  }
});

_Object$defineProperty(exports, "TransformerDirectiveFunc", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.TransformerDirectiveFunc;
  }
});

_Object$defineProperty(exports, "ValidatorDirective", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.ValidatorDirective;
  }
});

_Object$defineProperty(exports, "ValidatorDirectiveFunc", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.ValidatorDirectiveFunc;
  }
});

_Object$defineProperty(exports, "createTransformerDirective", {
  enumerable: true,
  get: function () {
    return _makeDirectives.createTransformerDirective;
  }
});

_Object$defineProperty(exports, "createValidatorDirective", {
  enumerable: true,
  get: function () {
    return _makeDirectives.createValidatorDirective;
  }
});

_Object$defineProperty(exports, "getDirectiveName", {
  enumerable: true,
  get: function () {
    return _makeDirectives.getDirectiveName;
  }
});

_Object$defineProperty(exports, "hasDirective", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.hasDirective;
  }
});

exports.rootSchema = void 0;

var _global = require("./global.api-auto-imports");

_forEachInstanceProperty(_context = _Object$keys(_global)).call(_context, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _global[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _global[key];
    }
  });
});

var _globalContext = require("./globalContext");

_forEachInstanceProperty(_context2 = _Object$keys(_globalContext)).call(_context2, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _globalContext[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _globalContext[key];
    }
  });
});

var _errors = require("./errors");

_forEachInstanceProperty(_context3 = _Object$keys(_errors)).call(_context3, function (key) {
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

var _graphql = require("./functions/graphql");

_forEachInstanceProperty(_context4 = _Object$keys(_graphql)).call(_context4, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _graphql[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _graphql[key];
    }
  });
});

var _useRequireAuth = require("./functions/useRequireAuth");

_forEachInstanceProperty(_context5 = _Object$keys(_useRequireAuth)).call(_context5, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _useRequireAuth[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _useRequireAuth[key];
    }
  });
});

var _makeMergedSchema = require("./makeMergedSchema/makeMergedSchema");

_forEachInstanceProperty(_context6 = _Object$keys(_makeMergedSchema)).call(_context6, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _makeMergedSchema[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _makeMergedSchema[key];
    }
  });
});

var _types = require("./types");

_forEachInstanceProperty(_context7 = _Object$keys(_types)).call(_context7, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});

var _makeDirectives = require("./directives/makeDirectives");

var _useRedwoodDirective = require("./plugins/useRedwoodDirective");

var _rootSchema = _interopRequireWildcard(require("./rootSchema"));

exports.rootSchema = _rootSchema;