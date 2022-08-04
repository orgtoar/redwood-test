"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  generate: true,
  buildApi: true,
  listQueryTypeFieldsInProject: true
};
Object.defineProperty(exports, "buildApi", {
  enumerable: true,
  get: function () {
    return _api.buildApi;
  }
});
Object.defineProperty(exports, "generate", {
  enumerable: true,
  get: function () {
    return _generate.generate;
  }
});
Object.defineProperty(exports, "listQueryTypeFieldsInProject", {
  enumerable: true,
  get: function () {
    return _gql.listQueryTypeFieldsInProject;
  }
});

var _paths = require("./paths");

Object.keys(_paths).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _paths[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _paths[key];
    }
  });
});

var _config = require("./config");

Object.keys(_config).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _config[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _config[key];
    }
  });
});

var _ts2js = require("./ts2js");

Object.keys(_ts2js).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ts2js[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ts2js[key];
    }
  });
});

var _dev = require("./dev");

Object.keys(_dev).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _dev[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _dev[key];
    }
  });
});

var _files = require("./files");

Object.keys(_files).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _files[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _files[key];
    }
  });
});

var _generate = require("./generate/generate");

var _api = require("./build/api");

var _validateSchema = require("./validateSchema");

Object.keys(_validateSchema).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _validateSchema[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _validateSchema[key];
    }
  });
});

var _api2 = require("./build/babel/api");

Object.keys(_api2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _api2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _api2[key];
    }
  });
});

var _web = require("./build/babel/web");

Object.keys(_web).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _web[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _web[key];
    }
  });
});

var _common = require("./build/babel/common");

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

var _gql = require("./gql");