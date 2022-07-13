"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.writePrerenderedHtmlFile = exports.runPrerender = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _react = _interopRequireDefault(require("react"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _server = _interopRequireDefault(require("react-dom/server"));

var _internal = require("@redwoodjs/internal");

var _router = require("@redwoodjs/router");

var _babelPluginRedwoodPrerenderMediaImports = _interopRequireDefault(require("./babelPlugins/babel-plugin-redwood-prerender-media-imports"));

var _internal2 = require("./internal");

const runPrerender = async ({
  routerPath
}) => {
  // Prerender specific configuration
  // extends projects web/babelConfig
  (0, _internal.registerWebSideBabelHook)({
    overrides: [{
      plugins: [['ignore-html-and-css-imports'], // webpack/postcss handles CSS imports
      [_babelPluginRedwoodPrerenderMediaImports.default]]
    }]
  });
  (0, _internal2.registerShims)(routerPath);

  const indexContent = _fs.default.readFileSync((0, _internal2.getRootHtmlPath)()).toString();

  const {
    default: App
  } = await _promise.default.resolve(`${(0, _internal.getPaths)().web.app}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));

  const componentAsHtml = _server.default.renderToString( /*#__PURE__*/_react.default.createElement(_router.LocationProvider, {
    location: {
      pathname: routerPath
    }
  }, /*#__PURE__*/_react.default.createElement(App, null)));

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
  const outputHtmlAbsPath = _path.default.join((0, _internal.getPaths)().base, outputHtmlPath); // Copy default (unprerendered) index.html to 200.html first
  // This is to prevent recursively rendering the home page


  if (outputHtmlPath === 'web/dist/index.html') {
    const html200Path = _path.default.join((0, _internal.getPaths)().web.dist, '200.html');

    if (!_fs.default.existsSync(html200Path)) {
      _fs.default.copyFileSync(outputHtmlAbsPath, html200Path);
    }
  }

  (0, _internal2.writeToDist)(outputHtmlAbsPath, content);
};

exports.writePrerenderedHtmlFile = writePrerenderedHtmlFile;