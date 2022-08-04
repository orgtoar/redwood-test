"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerWebSideBabelHook = exports.prebuildWebFile = exports.getWebSideOverrides = exports.getWebSideDefaultBabelConfig = exports.getWebSideBabelPresets = exports.getWebSideBabelPlugins = exports.getWebSideBabelConfigPath = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var babel = _interopRequireWildcard(require("@babel/core"));

var _paths = require("../../paths");

var _common = require("./common");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const getWebSideBabelPlugins = ({
  forJest
} = {
  forJest: false
}) => {
  const rwjsPaths = (0, _paths.getPaths)();
  const plugins = [...(0, _common.getCommonPlugins)(), // === Import path handling
  ['babel-plugin-module-resolver', {
    alias: {
      src: // Jest monorepo and multi project runner is not correctly determining
      // the `cwd`: https://github.com/facebook/jest/issues/7359
      forJest ? rwjsPaths.web.src : './src'
    },
    root: [rwjsPaths.web.base],
    cwd: 'packagejson',
    loglevel: 'silent' // to silence the unnecessary warnings

  }, 'rwjs-module-resolver'], [require('../babelPlugins/babel-plugin-redwood-src-alias').default, {
    srcAbsPath: rwjsPaths.web.src
  }, 'rwjs-babel-src-alias'], [require('../babelPlugins/babel-plugin-redwood-directory-named-import').default, undefined, 'rwjs-directory-named-modules'], // === Auto imports, and transforms
  ['babel-plugin-auto-import', {
    declarations: [{
      // import { React } from 'react'
      default: 'React',
      path: 'react'
    }, {
      // import PropTypes from 'prop-types'
      default: 'PropTypes',
      path: 'prop-types'
    }, {
      // import gql from 'graphql-tag'
      default: 'gql',
      path: 'graphql-tag'
    }]
  }, 'rwjs-web-auto-import'], ['babel-plugin-graphql-tag', undefined, 'rwjs-babel-graphql-tag'], ['inline-react-svg', {
    svgo: {
      plugins: [{
        name: 'removeAttrs',
        params: {
          attrs: '(data-name)'
        }
      }, // Otherwise having style="xxx" breaks
      'convertStyleToAttrs']
    }
  }, 'rwjs-inline-svg'] // === Handling redwood "magic"
  ].filter(Boolean);
  return plugins;
};

exports.getWebSideBabelPlugins = getWebSideBabelPlugins;

const getWebSideOverrides = ({
  staticImports
} = {
  staticImports: false
}) => {
  const overrides = [{
    test: /.+Cell.(js|tsx)$/,
    plugins: [require('../babelPlugins/babel-plugin-redwood-cell').default]
  }, // Automatically import files in `./web/src/pages/*` in to
  // the `./web/src/Routes.[ts|jsx]` file.
  {
    test: /Routes.(js|tsx)$/,
    plugins: [[require('../babelPlugins/babel-plugin-redwood-routes-auto-loader').default, {
      useStaticImports: staticImports
    }]]
  }, // ** Files ending in `Cell.mock.[js,ts]` **
  // Automatically determine keys for saving and retrieving mock data.
  // Only required for storybook and jest
  process.env.NODE_ENV !== 'production' && {
    test: /.+Cell.mock.(js|ts)$/,
    plugins: [require('../babelPlugins/babel-plugin-redwood-mock-cell-data').default]
  }].filter(Boolean);
  return overrides;
};

exports.getWebSideOverrides = getWebSideOverrides;

const getWebSideBabelPresets = () => {
  let reactPresetConfig = undefined; // This is a special case, where @babel/preset-react needs config
  // And using extends doesn't work

  if (getWebSideBabelConfigPath()) {
    var _userProjectConfig$pr;

    const userProjectConfig = require(getWebSideBabelConfigPath());

    (_userProjectConfig$pr = userProjectConfig.presets) === null || _userProjectConfig$pr === void 0 ? void 0 : _userProjectConfig$pr.forEach(preset => {
      // If it isn't a preset with special config ignore it
      if (!Array.isArray(preset)) {
        return;
      }

      const [presetName, presetConfig] = preset;

      if (presetName === '@babel/preset-react') {
        reactPresetConfig = presetConfig;
      }
    });
  }

  return [['@babel/preset-react', reactPresetConfig], ['@babel/preset-typescript', undefined, 'rwjs-babel-preset-typescript'], ['@babel/preset-env', {
    // the targets are set in <userProject>/web/package.json
    useBuiltIns: 'usage',
    corejs: {
      version: _common.CORE_JS_VERSION,
      proposals: true
    },
    exclude: [// Remove class-properties from preset-env, and include separately
    // https://github.com/webpack/webpack/issues/9708
    '@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-private-methods']
  }, 'rwjs-babel-preset-env']];
};

exports.getWebSideBabelPresets = getWebSideBabelPresets;

const getWebSideBabelConfigPath = () => {
  const customBabelConfig = _path.default.join((0, _paths.getPaths)().web.base, 'babel.config.js');

  if (_fs.default.existsSync(customBabelConfig)) {
    return customBabelConfig;
  } else {
    return undefined;
  }
}; // These flags toggle on/off certain features


exports.getWebSideBabelConfigPath = getWebSideBabelConfigPath;

const getWebSideDefaultBabelConfig = (options = {}) => {
  // NOTE:
  // Even though we specify the config file, babel will still search for .babelrc
  // and merge them because we have specified the filename property, unless babelrc = false
  return {
    presets: getWebSideBabelPresets(),
    plugins: getWebSideBabelPlugins(options),
    overrides: getWebSideOverrides(options),
    extends: getWebSideBabelConfigPath(),
    babelrc: false,
    ignore: ['node_modules']
  };
}; // Used in prerender only currently


exports.getWebSideDefaultBabelConfig = getWebSideDefaultBabelConfig;

const registerWebSideBabelHook = ({
  plugins = [],
  overrides = []
} = {}) => {
  const defaultOptions = getWebSideDefaultBabelConfig();
  (0, _common.registerBabel)({ ...defaultOptions,
    root: (0, _paths.getPaths)().base,
    extensions: ['.js', '.ts', '.tsx', '.jsx'],
    plugins: [...defaultOptions.plugins, ...plugins],
    cache: false,
    // We only register for prerender currently
    // Static importing pages makes sense
    overrides: [...getWebSideOverrides({
      staticImports: true
    }), ...overrides]
  });
}; // @MARK
// Currently only used in testing


exports.registerWebSideBabelHook = registerWebSideBabelHook;

const prebuildWebFile = (srcPath, flags = {}) => {
  const code = _fs.default.readFileSync(srcPath, 'utf-8');

  const defaultOptions = getWebSideDefaultBabelConfig(flags);
  const result = babel.transform(code, { ...defaultOptions,
    cwd: (0, _paths.getPaths)().web.base,
    filename: srcPath
  });
  return result;
};

exports.prebuildWebFile = prebuildWebFile;