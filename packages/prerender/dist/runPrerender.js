"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.writePrerenderedHtmlFile = exports.runPrerender = exports.PrerenderGqlError = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _values = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/values"));

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
  var _context, _context2;

  // Execute all gql queries we haven't already fetched
  await _promise.default.all((0, _map.default)(_context = (0, _entries.default)(queryCache)).call(_context, async ([cacheKey, value]) => {
    if (value.hasFetched) {
      // Already fetched this one; skip it!
      return _promise.default.resolve('');
    }

    const resultString = await (0, _graphql.executeQuery)(gqlHandler, value.query, value.variables);
    const result = JSON.parse(resultString);

    if (result.errors) {
      const message = result.errors[0].message ?? (0, _stringify.default)(result.errors);
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

  if ((0, _some.default)(_context2 = (0, _values.default)(queryCache)).call(_context2, value => !value.hasFetched)) {
    // We found new queries that we haven't fetched yet. Execute all new
    // queries and render again
    return recursivelyRender(App, renderPath, gqlHandler, queryCache);
  } else {
    return _promise.default.resolve(componentAsHtml);
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
  } = await _promise.default.resolve(`${(0, _paths.getPaths)().web.app}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
  const componentAsHtml = await recursivelyRender(App, renderPath, gqlHandler, queryCache);
  const {
    helmet
  } = global.__REDWOOD__HELMET_CONTEXT;

  const indexHtmlTree = _cheerio.default.load(indexContent);

  if (helmet) {
    const helmetElements = `
  ${helmet?.link.toString()}
  ${helmet?.meta.toString()}
  ${helmet?.script.toString()}
  ${helmet?.noscript.toString()}
  `; // Add all head elements

    indexHtmlTree('head').prepend(helmetElements); // Only change the title, if its not empty

    if (_cheerio.default.load(helmet?.title.toString())('title').text() !== '') {
      indexHtmlTree('title').replaceWith(helmet?.title.toString());
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