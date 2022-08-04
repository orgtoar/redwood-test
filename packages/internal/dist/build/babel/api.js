"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.registerApiSideBabelHook = exports.prebuildApiFile = exports.getApiSideDefaultBabelConfig = exports.getApiSideBabelPresets = exports.getApiSideBabelPlugins = exports.getApiSideBabelConfigPath = void 0;

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var babel = _interopRequireWildcard(require("@babel/core"));

var _paths = require("../../paths");

var _common = require("./common");

const TARGETS_NODE = '12.16'; // Warning! Use the minor core-js version: "corejs: '3.6'", instead of "corejs: 3",
// because we want to include the features added in the minor version.
// https://github.com/zloirock/core-js/blob/master/README.md#babelpreset-env
// Use preset env in all cases other than actual build
// e.g. jest, console and exec - because they rely on having transpiled code

const getApiSideBabelPresets = ({
  presetEnv
} = {
  presetEnv: false
}) => {
  var _context;

  return (0, _filter.default)(_context = ['@babel/preset-typescript', // Preset-env is required when we are not doing the transpilation with esbuild
  presetEnv && ['@babel/preset-env', {
    targets: {
      node: TARGETS_NODE
    },
    useBuiltIns: 'usage',
    corejs: {
      version: _common.CORE_JS_VERSION,
      // List of supported proposals: https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md#ecmascript-proposals
      proposals: true
    },
    exclude: [// Remove class-properties from preset-env, and include separately with loose
    // https://github.com/webpack/webpack/issues/9708
    '@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-private-methods']
  }]]).call(_context, Boolean);
};

exports.getApiSideBabelPresets = getApiSideBabelPresets;

const getApiSideBabelPlugins = ({
  forJest
} = {
  forJest: false
}) => {
  var _context2;

  const rwjsPaths = (0, _paths.getPaths)(); // Plugin shape: [ ["Target", "Options", "name"] ],
  // a custom "name" is supplied so that user's do not accidently overwrite
  // Redwood's own plugins when they specify their own.
  // const corejsMajorMinorVersion = pkgJson.dependencies['core-js']
  //   .split('.')
  //   .splice(0, 2)
  //   .join('.') // Gives '3.16' instead of '3.16.12'

  const plugins = (0, _filter.default)(_context2 = [...(0, _common.getCommonPlugins)(), ['@babel/plugin-transform-typescript', undefined, 'rwjs-babel-typescript'], // [
  //   'babel-plugin-polyfill-corejs3',
  //   {
  //     method: 'usage-global',
  //     corejs: corejsMajorMinorVersion,
  //     proposals: true, // Bug: https://github.com/zloirock/core-js/issues/978#issuecomment-904839852
  //     targets: { node: TARGETS_NODE }, // Netlify defaults NodeJS 12: https://answers.netlify.com/t/aws-lambda-now-supports-node-js-14/31789/3
  //   },
  //   'rwjs-babel-polyfill',
  // ],

  /**
   *  Uses modular polyfills from @babel/runtime-corejs3 but means
   *  @babel/runtime-corejs3 MUST be included as a dependency (esp on the api side)
   *
   *  Before: import "core-js/modules/esnext.string.replace-all.js"
   *  which pollutes the global scope
   *  After: import _replaceAllInstanceProperty from "@babel/runtime-corejs3/core-js/instance/replace-all"
   *  See packages/internal/src/__tests__/build_api.test.ts for examples
   *
   *  its important that we have @babel/runtime-corejs3 as a RUNTIME dependency on rwjs/api
   *  See table on https://babeljs.io/docs/en/babel-plugin-transform-runtime#corejs
   *
   */
  ['@babel/plugin-transform-runtime', {
    // https://babeljs.io/docs/en/babel-plugin-transform-runtime/#core-js-aliasing
    // Setting the version here also requires `@babel/runtime-corejs3`
    corejs: {
      version: 3,
      proposals: true
    },
    // https://babeljs.io/docs/en/babel-plugin-transform-runtime/#version
    // Transform-runtime assumes that @babel/runtime@7.0.0 is installed.
    // Specifying the version can result in a smaller bundle size.
    version: _common.RUNTIME_CORE_JS_VERSION
  }], // // still needed for jest.mock
  forJest && ['babel-plugin-module-resolver', {
    alias: {
      src: './src'
    },
    root: [rwjsPaths.api.base],
    cwd: 'packagejson',
    loglevel: 'silent' // to silence the unnecessary warnings

  }, 'rwjs-api-module-resolver'], [require('../babelPlugins/babel-plugin-redwood-src-alias').default, {
    srcAbsPath: rwjsPaths.api.src
  }, 'rwjs-babel-src-alias'], [require('../babelPlugins/babel-plugin-redwood-directory-named-import').default, undefined, 'rwjs-babel-directory-named-modules'], ['babel-plugin-auto-import', {
    declarations: [{
      // import gql from 'graphql-tag'
      default: 'gql',
      path: 'graphql-tag'
    }, {
      // import { context } from '@redwoodjs/graphql-server'
      members: ['context'],
      path: '@redwoodjs/graphql-server'
    }]
  }, 'rwjs-babel-auto-import'], // FIXME: `graphql-tag` is not working: https://github.com/redwoodjs/redwood/pull/3193
  ['babel-plugin-graphql-tag', undefined, 'rwjs-babel-graphql-tag'], [require('../babelPlugins/babel-plugin-redwood-import-dir').default, undefined, 'rwjs-babel-glob-import-dir']]).call(_context2, Boolean);
  return plugins;
};

exports.getApiSideBabelPlugins = getApiSideBabelPlugins;

const getApiSideBabelConfigPath = () => {
  const p = _path.default.join((0, _paths.getPaths)().api.base, 'babel.config.js');

  if (_fs.default.existsSync(p)) {
    return p;
  } else {
    return undefined;
  }
};

exports.getApiSideBabelConfigPath = getApiSideBabelConfigPath;

const getApiSideDefaultBabelConfig = () => {
  return {
    presets: getApiSideBabelPresets(),
    plugins: getApiSideBabelPlugins(),
    extends: getApiSideBabelConfigPath(),
    babelrc: false,
    ignore: ['node_modules']
  };
}; // Used in cli commands that need to use es6, lib and services


exports.getApiSideDefaultBabelConfig = getApiSideDefaultBabelConfig;

const registerApiSideBabelHook = ({
  plugins = [],
  ...rest
} = {}) => {
  const defaultOptions = getApiSideDefaultBabelConfig();
  (0, _common.registerBabel)({ ...defaultOptions,
    presets: getApiSideBabelPresets({
      presetEnv: true
    }),
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    plugins: [...defaultOptions.plugins, ...plugins],
    cache: false,
    ...rest
  });
};

exports.registerApiSideBabelHook = registerApiSideBabelHook;

const prebuildApiFile = (srcPath, dstPath, plugins) => {
  const code = _fs.default.readFileSync(srcPath, 'utf-8');

  const defaultOptions = getApiSideDefaultBabelConfig();
  const result = babel.transform(code, { ...defaultOptions,
    cwd: (0, _paths.getPaths)().api.base,
    filename: srcPath,
    // we set the sourceFile (for the sourcemap) as a correct, relative path
    // this is why this function (prebuildFile) must know about the dstPath
    sourceFileName: _path.default.relative(_path.default.dirname(dstPath), srcPath),
    // we need inline sourcemaps at this level
    // because this file will eventually be fed to esbuild
    // when esbuild finds an inline sourcemap, it tries to "combine" it
    // so the final sourcemap (the one that esbuild generates) combines both mappings
    sourceMaps: 'inline',
    plugins
  });
  return result;
};

exports.prebuildApiFile = prebuildApiFile;