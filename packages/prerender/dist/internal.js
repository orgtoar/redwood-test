"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.writeToDist = exports.registerShims = exports.getRootHtmlPath = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _crossUndiciFetch = require("cross-undici-fetch");

var _config = require("@redwoodjs/internal/dist/config");

var _paths = require("@redwoodjs/internal/dist/paths");

const INDEX_FILE = _path.default.join((0, _paths.getPaths)().web.dist, 'index.html');

const DEFAULT_INDEX = _path.default.join((0, _paths.getPaths)().web.dist, '200.html');

const getRootHtmlPath = () => {
  if (_fs.default.existsSync(DEFAULT_INDEX)) {
    return DEFAULT_INDEX;
  } else {
    return INDEX_FILE;
  }
};

exports.getRootHtmlPath = getRootHtmlPath;

const registerShims = routerPath => {
  var _rwjsConfig$web$apiGr;

  const rwjsConfig = (0, _config.getConfig)();
  global.RWJS_API_GRAPHQL_URL = (_rwjsConfig$web$apiGr = rwjsConfig.web.apiGraphQLUrl) !== null && _rwjsConfig$web$apiGr !== void 0 ? _rwjsConfig$web$apiGr : `${rwjsConfig.web.apiUrl}graphql`;
  global.__REDWOOD__APP_TITLE = rwjsConfig.web.title;

  global.__REDWOOD__USE_AUTH = () => ({
    loading: true,
    // this should play nicely if the app waits for auth stuff to comeback first before render
    isAuthenticated: false
  }); // we only need a partial AuthContextInterface for prerender


  global.__REDWOOD__PRERENDERING = true;
  global.__REDWOOD__HELMET_CONTEXT = {}; // Let routes auto loader plugin know

  process.env.__REDWOOD__PRERENDERING = '1'; // This makes code like global.location.pathname work also outside of the
  // router

  global.location = { ...global.location,
    pathname: routerPath
  }; // Shim fetch in the node.js context
  // This is to avoid using cross-fetch when configuring apollo-client
  // which would cause the client bundle size to increase

  if (!global.fetch) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    global.fetch = _crossUndiciFetch.fetch;
  }
};

exports.registerShims = registerShims;

const writeToDist = (outputHtmlPath, renderOutput) => {
  const dirName = _path.default.dirname(outputHtmlPath);

  const exist = _fs.default.existsSync(dirName);

  if (!exist) {
    _fs.default.mkdirSync(dirName, {
      recursive: true
    });
  }

  _fs.default.writeFileSync(outputHtmlPath, renderOutput);
};

exports.writeToDist = writeToDist;