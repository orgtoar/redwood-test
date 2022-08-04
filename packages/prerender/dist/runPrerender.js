"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writePrerenderedHtmlFile = exports.runPrerender = exports.PrerenderGqlError = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _react = _interopRequireDefault(require("react"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _server = _interopRequireDefault(require("react-dom/server"));

var _api = require("@redwoodjs/internal/dist/build/babel/api");

var _web = require("@redwoodjs/internal/dist/build/babel/web");

var _paths = require("@redwoodjs/internal/dist/paths");

var _router = require("@redwoodjs/router");

var _web2 = require("@redwoodjs/web");

var _babelPluginRedwoodPrerenderMediaImports = _interopRequireDefault(require("./babelPlugins/babel-plugin-redwood-prerender-media-imports"));

var _graphql = require("./graphql/graphql");

var _internal = require("./internal");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class PrerenderGqlError {
  constructor(message) {
    this.message = void 0;
    this.stack = void 0;
    this.message = 'GQL error: ' + message; // The stacktrace would just point to this file, which isn't helpful,
    // because that's not where the error is. So we're just putting the
    // message there as well

    this.stack = this.message;
  }

}

exports.PrerenderGqlError = PrerenderGqlError;

async function recursivelyRender(App, renderPath, gqlHandler, queryCache) {
  // Execute all gql queries we haven't already fetched
  await Promise.all(Object.entries(queryCache).map(async ([cacheKey, value]) => {
    if (value.hasFetched) {
      // Already fetched this one; skip it!
      return Promise.resolve('');
    }

    const resultString = await (0, _graphql.executeQuery)(gqlHandler, value.query, value.variables);
    const result = JSON.parse(resultString);

    if (result.errors) {
      var _result$errors$0$mess;

      const message = (_result$errors$0$mess = result.errors[0].message) !== null && _result$errors$0$mess !== void 0 ? _result$errors$0$mess : JSON.stringify(result.errors);
      throw new PrerenderGqlError(message);
    }

    queryCache[cacheKey] = { ...value,
      data: result.data,
      hasFetched: true
    };
    return result;
  }));

  const componentAsHtml = _server.default.renderToString( /*#__PURE__*/_react.default.createElement(_router.LocationProvider, {
    location: {
      pathname: renderPath
    }
  }, /*#__PURE__*/_react.default.createElement(_web2.CellCacheContextProvider, {
    queryCache: queryCache
  }, /*#__PURE__*/_react.default.createElement(App, null))));

  if (Object.values(queryCache).some(value => !value.hasFetched)) {
    // We found new queries that we haven't fetched yet. Execute all new
    // queries and render again
    return recursivelyRender(App, renderPath, gqlHandler, queryCache);
  } else {
    return Promise.resolve(componentAsHtml);
  }
}

const runPrerender = async ({
  queryCache,
  renderPath
}) => {
  // registerApiSideBabelHook already includes the default api side babel
  // config. So what we define here is additions to the default config
  (0, _api.registerApiSideBabelHook)({
    plugins: [['babel-plugin-module-resolver', {
      alias: {
        api: (0, _paths.getPaths)().api.base,
        web: (0, _paths.getPaths)().web.base
      },
      loglevel: 'silent' // to silence the unnecessary warnings

    }]],
    overrides: [{
      test: ['./api/'],
      plugins: [['babel-plugin-module-resolver', {
        alias: {
          src: (0, _paths.getPaths)().api.src
        },
        loglevel: 'silent'
      }, 'exec-api-src-module-resolver']]
    }]
  });
  const gqlHandler = await (0, _graphql.getGqlHandler)(); // Prerender specific configuration
  // extends projects web/babelConfig

  (0, _web.registerWebSideBabelHook)({
    overrides: [{
      plugins: [['ignore-html-and-css-imports'], // webpack/postcss handles CSS imports
      [_babelPluginRedwoodPrerenderMediaImports.default]]
    }]
  });
  (0, _internal.registerShims)(renderPath);

  const indexContent = _fs.default.readFileSync((0, _internal.getRootHtmlPath)()).toString();

  const {
    default: App
  } = await Promise.resolve(`${(0, _paths.getPaths)().web.app}`).then(s => _interopRequireWildcard(require(s)));
  const componentAsHtml = await recursivelyRender(App, renderPath, gqlHandler, queryCache);
  const {
    helmet
  } = global.__REDWOOD__HELMET_CONTEXT;

  const indexHtmlTree = _cheerio.default.load(indexContent);

  if (helmet) {
    const helmetElements = `
  ${helmet === null || helmet === void 0 ? void 0 : helmet.link.toString()}
  ${helmet === null || helmet === void 0 ? void 0 : helmet.meta.toString()}
  ${helmet === null || helmet === void 0 ? void 0 : helmet.script.toString()}
  ${helmet === null || helmet === void 0 ? void 0 : helmet.noscript.toString()}
  `; // Add all head elements

    indexHtmlTree('head').prepend(helmetElements); // Only change the title, if its not empty

    if (_cheerio.default.load(helmet === null || helmet === void 0 ? void 0 : helmet.title.toString())('title').text() !== '') {
      indexHtmlTree('title').replaceWith(helmet === null || helmet === void 0 ? void 0 : helmet.title.toString());
    }
  } // This is set by webpack by the html plugin


  indexHtmlTree('server-markup').replaceWith(componentAsHtml);
  const renderOutput = indexHtmlTree.html();
  return renderOutput;
}; // Used by cli at build time


exports.runPrerender = runPrerender;

const writePrerenderedHtmlFile = (outputHtmlPath, content) => {
  const outputHtmlAbsPath = _path.default.join((0, _paths.getPaths)().base, outputHtmlPath); // Copy default (unprerendered) index.html to 200.html first
  // This is to prevent recursively rendering the home page


  if (outputHtmlPath === 'web/dist/index.html') {
    const html200Path = _path.default.join((0, _paths.getPaths)().web.dist, '200.html');

    if (!_fs.default.existsSync(html200Path)) {
      _fs.default.copyFileSync(outputHtmlAbsPath, html200Path);
    }
  }

  (0, _internal.writeToDist)(outputHtmlAbsPath, content);
};

exports.writePrerenderedHtmlFile = writePrerenderedHtmlFile;