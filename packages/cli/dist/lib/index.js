"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.writeFilesTask = exports.writeFile = exports.usingVSCode = exports.transformTSToJS = exports.saveRemoteFileToDisk = exports.runCommandTask = exports.removeRoutesFromRouterTask = exports.readFile = exports.prettify = exports.prettierOptions = exports.nameVariants = exports.graphFunctionDoesExist = exports.getPaths = exports.getInstalledRedwoodVersion = exports.getGraphqlPath = exports.getDefaultArgs = exports.getConfig = exports.generateTemplate = exports.existsAnyExtensionSync = exports.deleteFilesTask = exports.deleteFile = exports.cleanupEmptyDirsTask = exports.bytes = exports.asyncForEach = exports.addScaffoldImport = exports.addRoutesToRouterTask = exports._getPaths = void 0;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _set = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/set"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));

var _fs = _interopRequireDefault(require("fs"));

var _https = _interopRequireDefault(require("https"));

var _path = _interopRequireDefault(require("path"));

var babel = _interopRequireWildcard(require("@babel/core"));

var _camelcase = _interopRequireDefault(require("camelcase"));

var _decamelize = _interopRequireDefault(require("decamelize"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _lodash = require("lodash");

var _string = _interopRequireDefault(require("lodash/string"));

var _paramCase = require("param-case");

var _pascalcase = _interopRequireDefault(require("pascalcase"));

var _prettier = require("prettier");

var _config = require("@redwoodjs/internal/dist/config");

var _paths = require("@redwoodjs/internal/dist/paths");

var _colors = _interopRequireDefault(require("./colors"));

var _rwPluralize = require("./rwPluralize");

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
/**
 * Returns variants of the passed `name` for usage in templates. If the given
 * name was "fooBar" then these would be:

 * pascalName: FooBar
 * singularPascalName: FooBar
 * pluralPascalName: FooBars
 * singularCamelName: fooBar
 * pluralCamelName: fooBars
 * singularParamName: foo-bar
 * pluralParamName: foo-bars
 * singularConstantName: FOO_BAR
 * pluralConstantName: FOO_BARS
*/


exports.asyncForEach = asyncForEach;

const nameVariants = name => {
  const normalizedName = (0, _pascalcase.default)((0, _paramCase.paramCase)((0, _rwPluralize.singularize)(name)));
  return {
    pascalName: (0, _pascalcase.default)((0, _paramCase.paramCase)(name)),
    camelName: (0, _camelcase.default)(name),
    singularPascalName: normalizedName,
    pluralPascalName: (0, _rwPluralize.pluralize)(normalizedName),
    singularCamelName: (0, _camelcase.default)(normalizedName),
    pluralCamelName: (0, _camelcase.default)((0, _rwPluralize.pluralize)(normalizedName)),
    singularParamName: (0, _paramCase.paramCase)(normalizedName),
    pluralParamName: (0, _paramCase.paramCase)((0, _rwPluralize.pluralize)(normalizedName)),
    singularConstantName: (0, _decamelize.default)(normalizedName).toUpperCase(),
    pluralConstantName: (0, _decamelize.default)((0, _rwPluralize.pluralize)(normalizedName)).toUpperCase()
  };
};

exports.nameVariants = nameVariants;

const generateTemplate = (templateFilename, {
  name,
  ...rest
}) => {
  const template = _string.default.template(readFile(templateFilename).toString());

  const renderedTemplate = template({
    name,
    ...nameVariants(name),
    ...rest
  });
  return prettify(templateFilename, renderedTemplate);
};

exports.generateTemplate = generateTemplate;

const prettify = (templateFilename, renderedTemplate) => {
  // We format .js and .css templates, we need to tell prettier which parser
  // we're using.
  // https://prettier.io/docs/en/options.html#parser
  const parser = {
    '.css': 'css',
    '.js': 'babel',
    '.ts': 'babel-ts'
  }[_path.default.extname(templateFilename.replace('.template', ''))];

  if (typeof parser === 'undefined') {
    return renderedTemplate;
  }

  return (0, _prettier.format)(renderedTemplate, { ...prettierOptions(),
    parser
  });
};

exports.prettify = prettify;

const readFile = target => _fs.default.readFileSync(target, {
  encoding: 'utf8'
});

exports.readFile = readFile;
const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.tsx'];

const deleteFile = file => {
  const extension = _path.default.extname(file);

  if ((0, _includes.default)(SUPPORTED_EXTENSIONS).call(SUPPORTED_EXTENSIONS, extension)) {
    const baseFile = getBaseFile(file);
    (0, _forEach.default)(SUPPORTED_EXTENSIONS).call(SUPPORTED_EXTENSIONS, ext => {
      const f = baseFile + ext;

      if (_fs.default.existsSync(f)) {
        _fs.default.unlinkSync(f);
      }
    });
  } else {
    _fs.default.unlinkSync(file);
  }
};

exports.deleteFile = deleteFile;

const getBaseFile = file => file.replace(/\.\w*$/, '');

const existsAnyExtensionSync = file => {
  const extension = _path.default.extname(file);

  if ((0, _includes.default)(SUPPORTED_EXTENSIONS).call(SUPPORTED_EXTENSIONS, extension)) {
    const baseFile = getBaseFile(file);
    return (0, _some.default)(SUPPORTED_EXTENSIONS).call(SUPPORTED_EXTENSIONS, ext => _fs.default.existsSync(baseFile + ext));
  }

  return _fs.default.existsSync(file);
};

exports.existsAnyExtensionSync = existsAnyExtensionSync;

const writeFile = (target, contents, {
  overwriteExisting = false
} = {}, task = {}) => {
  const {
    base
  } = getPaths();
  task.title = `Writing \`./${_path.default.relative(base, target)}\``;

  if (!overwriteExisting && _fs.default.existsSync(target)) {
    throw new Error(`${target} already exists.`);
  }

  const filename = _path.default.basename(target);

  const targetDir = target.replace(filename, '');

  _fs.default.mkdirSync(targetDir, {
    recursive: true
  });

  _fs.default.writeFileSync(target, contents);

  task.title = `Successfully wrote file \`./${_path.default.relative(base, target)}\``;
};

exports.writeFile = writeFile;

const saveRemoteFileToDisk = (url, localPath, {
  overwriteExisting = false
} = {}) => {
  if (!overwriteExisting && _fs.default.existsSync(localPath)) {
    throw new Error(`${localPath} already exists.`);
  }

  const downloadPromise = new _promise.default((resolve, reject) => _https.default.get(url, response => {
    if (response.statusCode === 200) {
      response.pipe(_fs.default.createWriteStream(localPath));
      resolve();
    } else {
      reject(new Error(`${url} responded with status code ${response.statusCode}`));
    }
  }));
  return downloadPromise;
};

exports.saveRemoteFileToDisk = saveRemoteFileToDisk;

const getInstalledRedwoodVersion = () => {
  try {
    const packageJson = require('../../package.json');

    return packageJson.version;
  } catch (e) {
    console.error(_colors.default.error('Could not find installed redwood version'));
    process.exit(1);
  }
};

exports.getInstalledRedwoodVersion = getInstalledRedwoodVersion;

const bytes = contents => Buffer.byteLength(contents, 'utf8');
/**
 * This wraps the core version of getPaths into something that catches the exception
 * and displays a helpful error message.
 */


exports.bytes = bytes;

const _getPaths = () => {
  try {
    return (0, _paths.getPaths)();
  } catch (e) {
    console.error(_colors.default.error(e.message));
    process.exit(1);
  }
};

exports._getPaths = _getPaths;
const getPaths = (0, _lodash.memoize)(_getPaths);
exports.getPaths = getPaths;

const getGraphqlPath = () => (0, _paths.resolveFile)(_path.default.join(getPaths().api.functions, 'graphql'));

exports.getGraphqlPath = getGraphqlPath;

const graphFunctionDoesExist = () => {
  return _fs.default.existsSync(getGraphqlPath());
};

exports.graphFunctionDoesExist = graphFunctionDoesExist;

const getConfig = () => {
  try {
    return (0, _config.getConfig)();
  } catch (e) {
    console.error(_colors.default.error(e.message));
    process.exit(1);
  }
};
/**
 * This returns the config present in `prettier.config.js` of a Redwood project.
 */


exports.getConfig = getConfig;

const prettierOptions = () => {
  try {
    return require(_path.default.join(getPaths().base, 'prettier.config.js'));
  } catch (e) {
    return undefined;
  }
}; // TODO: Move this into `generateTemplate` when all templates have TS support

/*
 * Convert a generated TS template file into JS.
 */


exports.prettierOptions = prettierOptions;

const transformTSToJS = (filename, content) => {
  const {
    code
  } = babel.transform(content, {
    filename,
    // If you ran `yarn rw generate` in `./web` transformSync would import the `.babelrc.js` file,
    // in `./web`? despite us setting `configFile: false`.
    cwd: process.env.NODE_ENV === 'test' ? undefined : getPaths().base,
    configFile: false,
    plugins: [['@babel/plugin-transform-typescript', {
      isTSX: true,
      allExtensions: true
    }]],
    retainLines: true
  });
  return prettify(filename.replace(/\.ts$/, '.js'), code);
};
/**
 * Creates a list of tasks that write files to the disk.
 *
 * @param files - {[filepath]: contents}
 */


exports.transformTSToJS = transformTSToJS;

const writeFilesTask = (files, options) => {
  var _context;

  const {
    base
  } = getPaths();
  return new _listr.default((0, _map.default)(_context = (0, _keys.default)(files)).call(_context, file => {
    const contents = files[file];
    return {
      title: `...waiting to write file \`./${_path.default.relative(base, file)}\`...`,
      task: (ctx, task) => writeFile(file, contents, options, task)
    };
  }));
};
/**
 * Creates a list of tasks that delete files from the disk.
 *
 * @param files - {[filepath]: contents}
 */


exports.writeFilesTask = writeFilesTask;

const deleteFilesTask = files => {
  var _context2;

  const {
    base
  } = getPaths();
  return new _listr.default([...(0, _map.default)(_context2 = (0, _keys.default)(files)).call(_context2, file => {
    return {
      title: `Destroying \`./${_path.default.relative(base, getBaseFile(file))}\`...`,
      skip: () => !existsAnyExtensionSync(file) && `File doesn't exist`,
      task: () => deleteFile(file)
    };
  }), {
    title: 'Cleaning up empty directories...',
    task: () => cleanupEmptyDirsTask(files)
  }]);
};
/**
 * @param files - {[filepath]: contents}
 * Deletes any empty directrories that are more than three levels deep below the base directory
 * i.e. any directory below /web/src/components
 */


exports.deleteFilesTask = deleteFilesTask;

const cleanupEmptyDirsTask = files => {
  var _context3;

  const {
    base
  } = getPaths();
  const endDirs = (0, _map.default)(_context3 = (0, _keys.default)(files)).call(_context3, file => _path.default.dirname(file));
  const uniqueEndDirs = [...new _set.default(endDirs)]; // get the additional path directories not at the end of the path

  const pathDirs = [];
  (0, _forEach.default)(uniqueEndDirs).call(uniqueEndDirs, dir => {
    const relDir = _path.default.relative(base, dir);

    const splitDir = relDir.split(_path.default.sep);
    splitDir.pop();

    while (splitDir.length > 3) {
      const subDir = _path.default.join(base, splitDir.join('/'));

      pathDirs.push(subDir);
      splitDir.pop();
    }
  });
  const uniqueDirs = (0, _concat.default)(uniqueEndDirs).call(uniqueEndDirs, [...new _set.default(pathDirs)]);
  return new _listr.default((0, _map.default)(uniqueDirs).call(uniqueDirs, dir => {
    return {
      title: `Removing empty \`./${_path.default.relative(base, dir)}\`...`,
      task: () => _fs.default.rmdirSync(dir),
      skip: () => {
        if (!_fs.default.existsSync(dir)) {
          return `Doesn't exist`;
        }

        if (_fs.default.readdirSync(dir).length > 0) {
          return 'Not empty';
        }

        return false;
      }
    };
  }));
};

exports.cleanupEmptyDirsTask = cleanupEmptyDirsTask;

const wrapWithSet = (routesContent, layout, routes, newLineAndIndent) => {
  const [_, indentOne, indentTwo] = routesContent.match(/([ \t]*)<Router.*?>[^<]*[\r\n]+([ \t]+)/) || ['', 0, 2];
  const oneLevelIndent = (0, _slice.default)(indentTwo).call(indentTwo, 0, indentTwo.length - indentOne.length);
  const newRoutesWithExtraIndent = (0, _map.default)(routes).call(routes, route => oneLevelIndent + route);
  return [`<Set wrap={${layout}}>`, ...newRoutesWithExtraIndent, `</Set>`].join(newLineAndIndent);
};
/**
 * Update the project's routes file.
 */


const addRoutesToRouterTask = (routes, layout) => {
  const redwoodPaths = getPaths();
  const routesContent = readFile(redwoodPaths.web.routes).toString();
  let newRoutes = (0, _filter.default)(routes).call(routes, route => !routesContent.match(route));

  if (newRoutes.length) {
    const [routerStart, routerParams, newLineAndIndent] = routesContent.match(/\s*<Router(.*?)>(\s*)/);

    if (/trailingSlashes={?(["'])always\1}?/.test(routerParams)) {
      // newRoutes will be something like:
      // ['<Route path="/foo" page={FooPage} name="foo"/>']
      // and we need to replace `path="/foo"` with `path="/foo/"`
      newRoutes = (0, _map.default)(newRoutes).call(newRoutes, route => route.replace(/ path="(.+?)" /, ' path="$1/" '));
    }

    const routesBatch = layout ? wrapWithSet(routesContent, layout, newRoutes, newLineAndIndent) : newRoutes.join(newLineAndIndent);
    const newRoutesContent = routesContent.replace(routerStart, `${routerStart + routesBatch + newLineAndIndent}`);
    writeFile(redwoodPaths.web.routes, newRoutesContent, {
      overwriteExisting: true
    });
  }
};

exports.addRoutesToRouterTask = addRoutesToRouterTask;

const addScaffoldImport = () => {
  const appJsPath = getPaths().web.app;
  let appJsContents = readFile(appJsPath).toString();

  if (appJsContents.match('./scaffold.css')) {
    return 'Skipping scaffold style include';
  }

  appJsContents = appJsContents.replace("import Routes from 'src/Routes'\n", "import Routes from 'src/Routes'\n\nimport './scaffold.css'");
  writeFile(appJsPath, appJsContents, {
    overwriteExisting: true
  });
  return 'Added scaffold import to App.{js,tsx}';
};

exports.addScaffoldImport = addScaffoldImport;

const removeEmtpySet = (routesContent, layout) => {
  const setWithLayoutReg = new RegExp(`\\s*<Set[^>]*wrap={${layout}}[^<]*>([^<]*)<\/Set>`);
  const [matchedSet, childContent] = routesContent.match(setWithLayoutReg) || [];

  if (!matchedSet) {
    return routesContent;
  }

  const child = childContent.replace(/\s/g, '');

  if (child.length > 0) {
    return routesContent;
  }

  return routesContent.replace(setWithLayoutReg, '');
};
/**
 * Remove named routes from the project's routes file.
 *
 * @param {string[]} routes - Route names
 */


const removeRoutesFromRouterTask = (routes, layout) => {
  const redwoodPaths = getPaths();
  const routesContent = readFile(redwoodPaths.web.routes).toString();
  const newRoutesContent = (0, _reduce.default)(routes).call(routes, (content, route) => {
    const matchRouteByName = new RegExp(`\\s*<Route[^>]*name="${route}"[^>]*/>`);
    return content.replace(matchRouteByName, '');
  }, routesContent);
  const routesWithoutEmptySet = layout ? removeEmtpySet(newRoutesContent, layout) : newRoutesContent;
  writeFile(redwoodPaths.web.routes, routesWithoutEmptySet, {
    overwriteExisting: true
  });
};

exports.removeRoutesFromRouterTask = removeRoutesFromRouterTask;

const runCommandTask = async (commands, {
  verbose
}) => {
  const tasks = new _listr.default((0, _map.default)(commands).call(commands, ({
    title,
    cmd,
    args,
    opts = {},
    cwd = getPaths().base
  }) => ({
    title,
    task: async () => {
      return (0, _execa.default)(cmd, args, {
        shell: true,
        cwd,
        stdio: verbose ? 'inherit' : 'pipe',
        extendEnv: true,
        cleanup: true,
        ...opts
      });
    }
  })), {
    renderer: verbose && _listrVerboseRenderer.default,
    dateFormat: false
  });

  try {
    await tasks.run();
    return true;
  } catch (e) {
    console.log(_colors.default.error(e.message));
    return false;
  }
};
/*
 * Extract default CLI args from an exported builder
 */


exports.runCommandTask = runCommandTask;

const getDefaultArgs = builder => {
  var _context4;

  return (0, _reduce.default)(_context4 = (0, _entries.default)(builder)).call(_context4, (options, [optionName, optionConfig]) => {
    // If a default is defined use it
    options[optionName] = optionConfig.default;
    return options;
  }, {});
};
/**
 * Check if user is using VS Code
 *
 * i.e. check for the existance of .vscode folder in root project directory
 */


exports.getDefaultArgs = getDefaultArgs;

const usingVSCode = () => {
  const redwoodPaths = getPaths();

  const VS_CODE_PATH = _path.default.join(redwoodPaths.base, '.vscode');

  return _fs.default.existsSync(VS_CODE_PATH);
};

exports.usingVSCode = usingVSCode;