"use strict";

var _context, _context2, _context3, _context4, _context5, _context6, _context7, _context8, _context9;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _exportNames = {
  generate: true,
  buildApi: true,
  listQueryTypeFieldsInProject: true
};

_Object$defineProperty(exports, "buildApi", {
  enumerable: true,
  get: function () {
    return _api.buildApi;
  }
});

_Object$defineProperty(exports, "generate", {
  enumerable: true,
  get: function () {
    return _generate.generate;
  }
});

_Object$defineProperty(exports, "listQueryTypeFieldsInProject", {
  enumerable: true,
  get: function () {
    return _gql.listQueryTypeFieldsInProject;
  }
});

var _paths = require("./paths");

_forEachInstanceProperty(_context = _Object$keys(_paths)).call(_context, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _paths[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _paths[key];
    }
  });
});

var _config = require("./config");

_forEachInstanceProperty(_context2 = _Object$keys(_config)).call(_context2, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _config[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _config[key];
    }
  });
});

var _ts2js = require("./ts2js");

_forEachInstanceProperty(_context3 = _Object$keys(_ts2js)).call(_context3, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ts2js[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ts2js[key];
    }
  });
});

var _dev = require("./dev");

_forEachInstanceProperty(_context4 = _Object$keys(_dev)).call(_context4, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _dev[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _dev[key];
    }
  });
});

var _files = require("./files");

_forEachInstanceProperty(_context5 = _Object$keys(_files)).call(_context5, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _files[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _files[key];
    }
  });
});

var _generate = require("./generate/generate");

var _api = require("./build/api");

var _validateSchema = require("./validateSchema");

_forEachInstanceProperty(_context6 = _Object$keys(_validateSchema)).call(_context6, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _validateSchema[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _validateSchema[key];
    }
  });
});

var _api2 = require("./build/babel/api");

_forEachInstanceProperty(_context7 = _Object$keys(_api2)).call(_context7, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _api2[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _api2[key];
    }
  });
});

var _web = require("./build/babel/web");

_forEachInstanceProperty(_context8 = _Object$keys(_web)).call(_context8, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _web[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _web[key];
    }
  });
});

var _common = require("./build/babel/common");

_forEachInstanceProperty(_context9 = _Object$keys(_common)).call(_context9, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _common[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _common[key];
    }
  });
});

var _gql = require("./gql");