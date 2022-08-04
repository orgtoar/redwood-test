"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveFile = exports.processPagesDir = exports.importStatementPath = exports.getPaths = exports.getConfigPath = exports.getBaseDirFromFile = exports.getBaseDir = exports.ensurePosixPath = void 0;

var _replaceAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/replace-all"));

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _findupSync = _interopRequireDefault(require("findup-sync"));

var _config = require("./config");

const CONFIG_FILE_NAME = 'redwood.toml'; // TODO: Remove these.

const PATH_API_DIR_FUNCTIONS = 'api/src/functions';
const PATH_RW_SCRIPTS = 'scripts';
const PATH_API_DIR_GRAPHQL = 'api/src/graphql';
const PATH_API_DIR_CONFIG = 'api/src/config';
const PATH_API_DIR_MODELS = 'api/src/models';
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
const PATH_WEB_DIR_CONFIG_STORYBOOK_MANAGER = 'web/config/storybook.manager.js';
const PATH_WEB_DIR_DIST = 'web/dist';
/**
 * Search the parent directories for the Redwood configuration file.
 */

const getConfigPath = (cwd = (() => {
  var _process$env$RWJS_CWD;

  return (_process$env$RWJS_CWD = process.env.RWJS_CWD) !== null && _process$env$RWJS_CWD !== void 0 ? _process$env$RWJS_CWD : process.cwd();
})()) => {
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


exports.getConfigPath = getConfigPath;

const getBaseDir = (configPath = getConfigPath()) => {
  return _path.default.dirname(configPath);
};

exports.getBaseDir = getBaseDir;

const getBaseDirFromFile = file => {
  return getBaseDir(getConfigPath(_path.default.dirname(file)));
};
/**
 * Use this to resolve files when the path to the file is known,
 * but the extension is not.
 */


exports.getBaseDirFromFile = getBaseDirFromFile;

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


exports.resolveFile = resolveFile;

const getPaths = (BASE_DIR = getBaseDir()) => {
  const routes = resolveFile(_path.default.join(BASE_DIR, PATH_WEB_ROUTES));
  const {
    schemaPath
  } = (0, _config.getConfig)(getConfigPath(BASE_DIR)).api;

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
      types: _path.default.join(BASE_DIR, 'api/types'),
      models: _path.default.join(BASE_DIR, PATH_API_DIR_MODELS)
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
      storybookManagerConfig: _path.default.join(BASE_DIR, PATH_WEB_DIR_CONFIG_STORYBOOK_MANAGER),
      dist: _path.default.join(BASE_DIR, PATH_WEB_DIR_DIST),
      types: _path.default.join(BASE_DIR, 'web/types')
    }
  };

  _fs.default.mkdirSync(paths.generated.types.includes, {
    recursive: true
  });

  _fs.default.mkdirSync(paths.generated.types.mirror, {
    recursive: true
  });

  return paths;
};
/**
 * Process the pages directory and return information useful for automated imports.
 *
 * Note: glob.sync returns posix style paths on Windows machines
 * @deprecated I will write a seperate method that use `getFiles` instead. This
 * is used by structure, babel auto-importer and the eslint plugin.
 */


exports.getPaths = getPaths;

const processPagesDir = (webPagesDir = getPaths().web.pages) => {
  const pagePaths = _fastGlob.default.sync('**/*Page.{js,jsx,ts,tsx}', {
    cwd: webPagesDir,
    ignore: ['node_modules']
  });

  return pagePaths.map(pagePath => {
    const p = _path.default.parse(pagePath);

    const importName = p.dir.replace(/\//g, '');
    const importPath = importStatementPath(_path.default.join(webPagesDir, p.dir, p.name));
    const importStatement = `const ${importName} = { name: '${importName}', loader: import('${importPath}') }`;
    return {
      importName,
      const: importName,
      importPath,
      path: _path.default.join(webPagesDir, pagePath),
      importStatement
    };
  });
};
/**
 * Converts Windows-style paths to Posix-style
 * C:\Users\Bob\dev\Redwood -> /c/Users/Bob/dev/Redwood
 *
 * The conversion only happens on Windows systems, and only for paths that are
 * not already Posix-style
 *
 * @param path Filesystem path
 */


exports.processPagesDir = processPagesDir;

const ensurePosixPath = path => {
  let posixPath = path;

  if (process.platform === 'win32') {
    if (/^[A-Z]:\\/.test(path)) {
      const drive = path[0].toLowerCase();
      posixPath = `/${drive}/${path.substring(3)}`;
    }

    posixPath = posixPath.replace(/\\/g, '/');
  }

  return posixPath;
};
/**
 * Switches backslash to regular slash on Windows so the path works in
 * import statements
 * C:\Users\Bob\dev\Redwood\UserPage\UserPage ->
 * C:/Users/Bob/dev/Redwood/UserPage/UserPage
 *
 * @param path Filesystem path
 */


exports.ensurePosixPath = ensurePosixPath;

const importStatementPath = path => {
  let importPath = path;

  if (process.platform === 'win32') {
    importPath = (0, _replaceAll.default)(importPath).call(importPath, '\\', '/');
  }

  return importPath;
};

exports.importStatementPath = importStatementPath;