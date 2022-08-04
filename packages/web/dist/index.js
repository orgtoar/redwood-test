"use strict";

var _context, _context2, _context3, _context4;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _exportNames = {
  FatalErrorBoundary: true,
  FetchConfigProvider: true,
  useFetchConfig: true,
  GraphQLHooksProvider: true,
  useQuery: true,
  useMutation: true,
  createCell: true,
  CellProps: true,
  CellFailureProps: true,
  CellLoadingProps: true,
  CellSuccessProps: true,
  CellSuccessData: true,
  Head: true,
  Helmet: true
};

_Object$defineProperty(exports, "CellFailureProps", {
  enumerable: true,
  get: function () {
    return _createCell.CellFailureProps;
  }
});

_Object$defineProperty(exports, "CellLoadingProps", {
  enumerable: true,
  get: function () {
    return _createCell.CellLoadingProps;
  }
});

_Object$defineProperty(exports, "CellProps", {
  enumerable: true,
  get: function () {
    return _createCell.CellProps;
  }
});

_Object$defineProperty(exports, "CellSuccessData", {
  enumerable: true,
  get: function () {
    return _createCell.CellSuccessData;
  }
});

_Object$defineProperty(exports, "CellSuccessProps", {
  enumerable: true,
  get: function () {
    return _createCell.CellSuccessProps;
  }
});

_Object$defineProperty(exports, "FatalErrorBoundary", {
  enumerable: true,
  get: function () {
    return _FatalErrorBoundary.default;
  }
});

_Object$defineProperty(exports, "FetchConfigProvider", {
  enumerable: true,
  get: function () {
    return _FetchConfigProvider.FetchConfigProvider;
  }
});

_Object$defineProperty(exports, "GraphQLHooksProvider", {
  enumerable: true,
  get: function () {
    return _GraphQLHooksProvider.GraphQLHooksProvider;
  }
});

_Object$defineProperty(exports, "Head", {
  enumerable: true,
  get: function () {
    return _reactHelmetAsync.Helmet;
  }
});

_Object$defineProperty(exports, "Helmet", {
  enumerable: true,
  get: function () {
    return _reactHelmetAsync.Helmet;
  }
});

_Object$defineProperty(exports, "createCell", {
  enumerable: true,
  get: function () {
    return _createCell.createCell;
  }
});

_Object$defineProperty(exports, "useFetchConfig", {
  enumerable: true,
  get: function () {
    return _FetchConfigProvider.useFetchConfig;
  }
});

_Object$defineProperty(exports, "useMutation", {
  enumerable: true,
  get: function () {
    return _GraphQLHooksProvider.useMutation;
  }
});

_Object$defineProperty(exports, "useQuery", {
  enumerable: true,
  get: function () {
    return _GraphQLHooksProvider.useQuery;
  }
});

require("./global.web-auto-imports");

require("./config");

require("./assetImports");

var _FatalErrorBoundary = _interopRequireDefault(require("./components/FatalErrorBoundary"));

var _FetchConfigProvider = require("./components/FetchConfigProvider");

var _GraphQLHooksProvider = require("./components/GraphQLHooksProvider");

var _CellCacheContext = require("./components/CellCacheContext");

_forEachInstanceProperty(_context = _Object$keys(_CellCacheContext)).call(_context, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _CellCacheContext[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _CellCacheContext[key];
    }
  });
});

var _createCell = require("./components/createCell");

var _graphql = require("./graphql");

_forEachInstanceProperty(_context2 = _Object$keys(_graphql)).call(_context2, function (key) {
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

var _RedwoodProvider = require("./components/RedwoodProvider");

_forEachInstanceProperty(_context3 = _Object$keys(_RedwoodProvider)).call(_context3, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _RedwoodProvider[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _RedwoodProvider[key];
    }
  });
});

var _MetaTags = require("./components/MetaTags");

_forEachInstanceProperty(_context4 = _Object$keys(_MetaTags)).call(_context4, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _MetaTags[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _MetaTags[key];
    }
  });
});

var _reactHelmetAsync = require("react-helmet-async");