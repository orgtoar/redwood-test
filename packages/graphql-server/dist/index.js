"use strict";

Object.defineProperty(exports, "__esModule", {
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
Object.defineProperty(exports, "DirectiveParams", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.DirectiveParams;
  }
});
Object.defineProperty(exports, "DirectiveType", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.DirectiveType;
  }
});
Object.defineProperty(exports, "RedwoodDirective", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.RedwoodDirective;
  }
});
Object.defineProperty(exports, "TransformerDirective", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.TransformerDirective;
  }
});
Object.defineProperty(exports, "TransformerDirectiveFunc", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.TransformerDirectiveFunc;
  }
});
Object.defineProperty(exports, "ValidatorDirective", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.ValidatorDirective;
  }
});
Object.defineProperty(exports, "ValidatorDirectiveFunc", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.ValidatorDirectiveFunc;
  }
});
Object.defineProperty(exports, "createTransformerDirective", {
  enumerable: true,
  get: function () {
    return _makeDirectives.createTransformerDirective;
  }
});
Object.defineProperty(exports, "createValidatorDirective", {
  enumerable: true,
  get: function () {
    return _makeDirectives.createValidatorDirective;
  }
});
Object.defineProperty(exports, "getDirectiveName", {
  enumerable: true,
  get: function () {
    return _makeDirectives.getDirectiveName;
  }
});
Object.defineProperty(exports, "hasDirective", {
  enumerable: true,
  get: function () {
    return _useRedwoodDirective.hasDirective;
  }
});
exports.rootSchema = void 0;

var _global = require("./global.api-auto-imports");

Object.keys(_global).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _global[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _global[key];
    }
  });
});

var _globalContext = require("./globalContext");

Object.keys(_globalContext).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _globalContext[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _globalContext[key];
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

var _graphql = require("./functions/graphql");

Object.keys(_graphql).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _graphql[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _graphql[key];
    }
  });
});

var _useRequireAuth = require("./functions/useRequireAuth");

Object.keys(_useRequireAuth).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _useRequireAuth[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _useRequireAuth[key];
    }
  });
});

var _makeMergedSchema = require("./makeMergedSchema/makeMergedSchema");

Object.keys(_makeMergedSchema).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _makeMergedSchema[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _makeMergedSchema[key];
    }
  });
});

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }