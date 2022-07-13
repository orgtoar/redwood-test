"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _findupSync = _interopRequireDefault(require("findup-sync"));

var _toml = _interopRequireDefault(require("toml"));

var TargetEnum;

(function (TargetEnum) {
  TargetEnum["NODE"] = "node";
  TargetEnum["BROWSER"] = "browser";
  TargetEnum["REACT_NATIVE"] = "react-native";
  TargetEnum["ELECTRON"] = "electron";
})(TargetEnum || (TargetEnum = {}));

// Note that web's includeEnvironmentVariables is handled in `webpack.common.js`
// https://github.com/redwoodjs/redwood/blob/d51ade08118c17459cebcdb496197ea52485364a/packages/core/config/webpack.common.js#L19
const DEFAULT_CONFIG = {
  web: {
    title: 'Redwood App',
    host: 'localhost',
    port: 8910,
    path: './web',
    target: TargetEnum.BROWSER,
    apiProxyPath: '/.netlify/functions',
    apiProxyPort: 8911,
    fastRefresh: true,
    a11y: true
  },
  api: {
    title: 'Redwood App',
    host: 'localhost',
    port: 8911,
    path: './api',
    target: TargetEnum.NODE,
    schemaPath: './api/db/schema.prisma'
  },
  browser: {
    open: false
  },
  generate: {
    tests: true,
    stories: true,
    nestScaffoldByModel: true
  }
};
/**
 * These configuration options are modified by the user via the Redwood
 * config file.
 */

const getConfig = (configPath = getConfigPath()) => {
  try {
    const rawConfig = _fs.default.readFileSync(configPath, 'utf8');

    return (0, _deepmerge.default)(DEFAULT_CONFIG, _toml.default.parse(rawConfig));
  } catch (e) {
    throw new Error(`Could not parse "${configPath}": ${e}`);
  }
};

const CONFIG_FILE_NAME = 'redwood.toml'; // TODO: Remove these.

const PATH_API_DIR_FUNCTIONS = 'api/src/functions';
const PATH_RW_SCRIPTS = 'scripts';
const PATH_API_DIR_GRAPHQL = 'api/src/graphql';
const PATH_API_DIR_CONFIG = 'api/src/config';
const PATH_API_DIR_LIB = 'api/src/lib';
const PATH_API_DIR_GENERATORS = 'api/generators';
const PATH_API_DIR_SERVICES = 'api/src/services';
const PATH_API_DIR_DIRECTIVES = 'api/src/directives';
const PATH_API_DIR_SRC = 'api/src';
const PATH_WEB_ROUTES = 'web/src/Routes'; // .js|.tsx

const PATH_WEB_DIR_LAYOUTS = 'web/src/layouts/';
const PATH_WEB_DIR_PAGES = 'web/src/pages/';
const PATH_WEB_DIR_COMPONENTS = 'web/src/components';
const PATH_WEB_DIR_SRC = 'web/src';
const PATH_WEB_DIR_SRC_APP = 'web/src/App';
const PATH_WEB_DIR_SRC_INDEX = 'web/src/index'; // .js|.tsx

const PATH_WEB_DIR_GENERATORS = 'web/generators';
const PATH_WEB_DIR_CONFIG = 'web/config';
const PATH_WEB_DIR_CONFIG_WEBPACK = 'web/config/webpack.config.js';
const PATH_WEB_DIR_CONFIG_POSTCSS = 'web/config/postcss.config.js';
const PATH_WEB_DIR_CONFIG_STORYBOOK_CONFIG = 'web/config/storybook.config.js';
const PATH_WEB_DIR_CONFIG_STORYBOOK_PREVIEW = 'web/config/storybook.preview.js';
const PATH_WEB_DIR_DIST = 'web/dist';
/**
 * Search the parent directories for the Redwood configuration file.
 */

const getConfigPath = (cwd = process.env.RWJS_CWD ?? process.cwd()) => {
  const configPath = (0, _findupSync.default)(CONFIG_FILE_NAME, {
    cwd
  });

  if (!configPath) {
    throw new Error(`Could not find a "${CONFIG_FILE_NAME}" file, are you sure you're in a Redwood project?`);
  }

  return configPath;
};
/**
 * The Redwood config file is used as an anchor for the base directory of a project.
 */


const getBaseDir = (configPath = getConfigPath()) => {
  return _path.default.dirname(configPath);
};
/**
 * Use this to resolve files when the path to the file is known,
 * but the extension is not.
 */


const resolveFile = (filePath, extensions = ['.js', '.tsx', '.ts', '.jsx']) => {
  for (const extension of extensions) {
    const p = `${filePath}${extension}`;

    if (_fs.default.existsSync(p)) {
      return p;
    }
  }

  return null;
};
/**
 * Path constants that are relevant to a Redwood project.
 */
// TODO: Make this a proxy and make it lazy.


const getRWPaths = (BASE_DIR = getBaseDir()) => {
  const routes = resolveFile(_path.default.join(BASE_DIR, PATH_WEB_ROUTES));
  const {
    schemaPath
  } = getConfig(getConfigPath(BASE_DIR)).api;

  const schemaDir = _path.default.dirname(schemaPath);

  const paths = {
    base: BASE_DIR,
    generated: {
      base: _path.default.join(BASE_DIR, '.redwood'),
      schema: _path.default.join(BASE_DIR, '.redwood/schema.graphql'),
      types: {
        includes: _path.default.join(BASE_DIR, '.redwood/types/includes'),
        mirror: _path.default.join(BASE_DIR, '.redwood/types/mirror')
      },
      prebuild: _path.default.join(BASE_DIR, '.redwood/prebuild')
    },
    scripts: _path.default.join(BASE_DIR, PATH_RW_SCRIPTS),
    api: {
      base: _path.default.join(BASE_DIR, 'api'),
      dataMigrations: _path.default.join(BASE_DIR, schemaDir, 'dataMigrations'),
      db: _path.default.join(BASE_DIR, schemaDir),
      dbSchema: _path.default.join(BASE_DIR, schemaPath),
      functions: _path.default.join(BASE_DIR, PATH_API_DIR_FUNCTIONS),
      graphql: _path.default.join(BASE_DIR, PATH_API_DIR_GRAPHQL),
      lib: _path.default.join(BASE_DIR, PATH_API_DIR_LIB),
      generators: _path.default.join(BASE_DIR, PATH_API_DIR_GENERATORS),
      config: _path.default.join(BASE_DIR, PATH_API_DIR_CONFIG),
      services: _path.default.join(BASE_DIR, PATH_API_DIR_SERVICES),
      directives: _path.default.join(BASE_DIR, PATH_API_DIR_DIRECTIVES),
      src: _path.default.join(BASE_DIR, PATH_API_DIR_SRC),
      dist: _path.default.join(BASE_DIR, 'api/dist'),
      types: _path.default.join(BASE_DIR, 'api/types')
    },
    web: {
      routes,
      base: _path.default.join(BASE_DIR, 'web'),
      pages: _path.default.join(BASE_DIR, PATH_WEB_DIR_PAGES),
      components: _path.default.join(BASE_DIR, PATH_WEB_DIR_COMPONENTS),
      layouts: _path.default.join(BASE_DIR, PATH_WEB_DIR_LAYOUTS),
      src: _path.default.join(BASE_DIR, PATH_WEB_DIR_SRC),
      generators: _path.default.join(BASE_DIR, PATH_WEB_DIR_GENERATORS),
      app: resolveFile(_path.default.join(BASE_DIR, PATH_WEB_DIR_SRC_APP)),
      index: resolveFile(_path.default.join(BASE_DIR, PATH_WEB_DIR_SRC_INDEX)),
      config: _path.default.join(BASE_DIR, PATH_WEB_DIR_CONFIG),
      webpack: _path.default.join(BASE_DIR, PATH_WEB_DIR_CONFIG_WEBPACK),
      postcss: _path.default.join(BASE_DIR, PATH_WEB_DIR_CONFIG_POSTCSS),
      storybookConfig: _path.default.join(BASE_DIR, PATH_WEB_DIR_CONFIG_STORYBOOK_CONFIG),
      storybookPreviewConfig: _path.default.join(BASE_DIR, PATH_WEB_DIR_CONFIG_STORYBOOK_PREVIEW),
      dist: _path.default.join(BASE_DIR, PATH_WEB_DIR_DIST),
      types: _path.default.join(BASE_DIR, 'web/types')
    }
  };
  return paths;
};

var _default = getRWPaths;
exports.default = _default;