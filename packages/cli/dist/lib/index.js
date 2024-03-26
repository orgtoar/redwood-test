"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.existsAnyExtensionSync = exports.deleteFilesTask = exports.deleteFile = exports.cleanupEmptyDirsTask = exports.bytes = exports.addScaffoldImport = exports.addRoutesToRouterTask = exports.addPackagesTask = exports._getPaths = void 0;
_Object$defineProperty(exports, "findUp", {
  enumerable: true,
  get: function () {
    return _projectConfig.findUp;
  }
});
exports.writeFilesTask = exports.writeFile = exports.usingVSCode = exports.transformTSToJS = exports.saveRemoteFileToDisk = exports.runCommandTask = exports.resolveFile = exports.removeRoutesFromRouterTask = exports.readFile = exports.printSetupNotes = exports.prettify = exports.nameVariants = exports.graphFunctionDoesExist = exports.getPrettierOptions = exports.getPaths = exports.getInstalledRedwoodVersion = exports.getGraphqlPath = exports.getDefaultArgs = exports.getConfig = exports.generateTemplate = void 0;
require("core-js/modules/es.array.push.js");
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _set = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/set"));
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));
var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));
var _child_process = require("child_process");
var _https = _interopRequireDefault(require("https"));
var _path = _interopRequireDefault(require("path"));
var babel = _interopRequireWildcard(require("@babel/core"));
var _boxen = _interopRequireDefault(require("boxen"));
var _camelcase = _interopRequireDefault(require("camelcase"));
var _decamelize = _interopRequireDefault(require("decamelize"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _lodash = require("lodash");
var _paramCase = require("param-case");
var _pascalcase = _interopRequireDefault(require("pascalcase"));
var _prettier = require("prettier");
var _projectConfig = require("@redwoodjs/project-config");
var _colors = _interopRequireDefault(require("./colors"));
var _rollback = require("./rollback");
var _rwPluralize = require("./rwPluralize");
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
  try {
    const templateFn = (0, _lodash.template)(readFile(templateFilename).toString());
    const renderedTemplate = templateFn({
      name,
      ...nameVariants(name),
      ...rest
    });
    return prettify(templateFilename, renderedTemplate);
  } catch (error) {
    error.message = `Error applying template at ${templateFilename} for ${name}: ${error.message}`;
    throw error;
  }
};
exports.generateTemplate = generateTemplate;
const prettify = async (templateFilename, renderedTemplate) => {
  // We format .js and .css templates, we need to tell prettier which parser
  // we're using.
  // https://prettier.io/docs/en/options.html#parser
  const parser = {
    '.css': 'css',
    '.js': 'babel',
    '.jsx': 'babel',
    '.ts': 'babel-ts',
    '.tsx': 'babel-ts'
  }[_path.default.extname(templateFilename.replace('.template', ''))];
  if (typeof parser === 'undefined') {
    return renderedTemplate;
  }
  const prettierOptions = await getPrettierOptions();
  return (0, _prettier.format)(renderedTemplate, {
    ...prettierOptions,
    parser
  });
};
exports.prettify = prettify;
const readFile = target => _fsExtra.default.readFileSync(target, {
  encoding: 'utf8'
});
exports.readFile = readFile;
const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const deleteFile = file => {
  const extension = _path.default.extname(file);
  if ((0, _includes.default)(SUPPORTED_EXTENSIONS).call(SUPPORTED_EXTENSIONS, extension)) {
    const baseFile = getBaseFile(file);
    (0, _forEach.default)(SUPPORTED_EXTENSIONS).call(SUPPORTED_EXTENSIONS, ext => {
      const f = baseFile + ext;
      if (_fsExtra.default.existsSync(f)) {
        _fsExtra.default.unlinkSync(f);
      }
    });
  } else {
    _fsExtra.default.unlinkSync(file);
  }
};
exports.deleteFile = deleteFile;
const getBaseFile = file => file.replace(/\.\w*$/, '');
const existsAnyExtensionSync = file => {
  const extension = _path.default.extname(file);
  if ((0, _includes.default)(SUPPORTED_EXTENSIONS).call(SUPPORTED_EXTENSIONS, extension)) {
    const baseFile = getBaseFile(file);
    return (0, _some.default)(SUPPORTED_EXTENSIONS).call(SUPPORTED_EXTENSIONS, ext => _fsExtra.default.existsSync(baseFile + ext));
  }
  return _fsExtra.default.existsSync(file);
};
exports.existsAnyExtensionSync = existsAnyExtensionSync;
const writeFile = (target, contents, {
  overwriteExisting = false
} = {}, task = {}) => {
  const {
    base
  } = getPaths();
  task.title = `Writing \`./${_path.default.relative(base, target)}\``;
  if (!overwriteExisting && _fsExtra.default.existsSync(target)) {
    throw new Error(`${target} already exists.`);
  }
  (0, _rollback.addFileToRollback)(target);
  const filename = _path.default.basename(target);
  const targetDir = target.replace(filename, '');
  _fsExtra.default.mkdirSync(targetDir, {
    recursive: true
  });
  _fsExtra.default.writeFileSync(target, contents);
  task.title = `Successfully wrote file \`./${_path.default.relative(base, target)}\``;
};
exports.writeFile = writeFile;
const saveRemoteFileToDisk = (url, localPath, {
  overwriteExisting = false
} = {}) => {
  if (!overwriteExisting && _fsExtra.default.existsSync(localPath)) {
    throw new Error(`${localPath} already exists.`);
  }
  const downloadPromise = new _promise.default((resolve, reject) => _https.default.get(url, response => {
    if (response.statusCode === 200) {
      response.pipe(_fsExtra.default.createWriteStream(localPath));
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
    // @ts-ignore TS Config issue, due to src being the rootDir
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
    return (0, _projectConfig.getPaths)();
  } catch (e) {
    console.error(_colors.default.error(e.message));
    process.exit(1);
  }
};
exports._getPaths = _getPaths;
const getPaths = exports.getPaths = (0, _lodash.memoize)(_getPaths);
const resolveFile = exports.resolveFile = _projectConfig.resolveFile;
const getGraphqlPath = () => resolveFile(_path.default.join(getPaths().api.functions, 'graphql'));
exports.getGraphqlPath = getGraphqlPath;
const graphFunctionDoesExist = () => {
  return _fsExtra.default.existsSync(getGraphqlPath());
};
exports.graphFunctionDoesExist = graphFunctionDoesExist;
const getConfig = () => {
  try {
    return (0, _projectConfig.getConfig)();
  } catch (e) {
    console.error(_colors.default.error(e.message));
    process.exit(1);
  }
};

/**
 * This returns the config present in `prettier.config.js` of a Redwood project.
 */
exports.getConfig = getConfig;
const getPrettierOptions = async () => {
  try {
    const {
      default: prettierOptions
    } = await import(`file://${_path.default.join(getPaths().base, 'prettier.config.js')}`);
    return prettierOptions;
  } catch (e) {
    // If we're in our vitest environment we want to return a consistent set of prettier options
    // such that snapshots don't change unexpectedly.
    if (process.env.VITEST_POOL_ID !== undefined) {
      return {
        trailingComma: 'es5',
        bracketSpacing: true,
        tabWidth: 2,
        semi: false,
        singleQuote: true,
        arrowParens: 'always',
        overrides: [{
          files: 'Routes.*',
          options: {
            printWidth: 999
          }
        }]
      };
    }
    return undefined;
  }
};

// TODO: Move this into `generateTemplate` when all templates have TS support
/*
 * Convert a generated TS template file into JS.
 */
exports.getPrettierOptions = getPrettierOptions;
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
  return prettify(filename.replace(/\.ts(x)?$/, '.js$1'), code);
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
  return new _listr.Listr((0, _map.default)(_context = (0, _keys.default)(files)).call(_context, file => {
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
  return new _listr.Listr([...(0, _map.default)(_context2 = (0, _keys.default)(files)).call(_context2, file => {
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
 * Deletes any empty directories that are more than three levels deep below the base directory
 * i.e. any directory below /web/src/components
 */
exports.deleteFilesTask = deleteFilesTask;
const cleanupEmptyDirsTask = files => {
  var _context3;
  const {
    base
  } = getPaths();
  const endDirs = (0, _map.default)(_context3 = (0, _keys.default)(files)).call(_context3, file => _path.default.dirname(file));
  const uniqueEndDirs = [...new _set.default(endDirs)];
  // get the additional path directories not at the end of the path
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
  return new _listr.Listr((0, _map.default)(uniqueDirs).call(uniqueDirs, dir => {
    return {
      title: `Removing empty \`./${_path.default.relative(base, dir)}\`...`,
      task: () => _fsExtra.default.rmdirSync(dir),
      skip: () => {
        if (!_fsExtra.default.existsSync(dir)) {
          return `Doesn't exist`;
        }
        if (_fsExtra.default.readdirSync(dir).length > 0) {
          return 'Not empty';
        }
        return false;
      }
    };
  }));
};
exports.cleanupEmptyDirsTask = cleanupEmptyDirsTask;
const wrapWithSet = (routesContent, layout, routes, newLineAndIndent, props = {}) => {
  var _context4;
  const [_, indentOne, indentTwo] = routesContent.match(/([ \t]*)<Router.*?>[^<]*[\r\n]+([ \t]+)/) || ['', 0, 2];
  const oneLevelIndent = (0, _slice.default)(indentTwo).call(indentTwo, 0, indentTwo.length - indentOne.length);
  const newRoutesWithExtraIndent = (0, _map.default)(routes).call(routes, route => oneLevelIndent + route);

  // converts { foo: 'bar' } to `foo="bar"`
  const propsString = (0, _map.default)(_context4 = (0, _entries.default)(props)).call(_context4, values => `${values[0]}="${values[1]}"`).join(' ');
  return [`<Set wrap={${layout}}${propsString && ' ' + propsString}>`, ...newRoutesWithExtraIndent, `</Set>`].join(newLineAndIndent);
};

/**
 * Update the project's routes file.
 */
const addRoutesToRouterTask = (routes, layout, setProps = {}) => {
  const redwoodPaths = getPaths();
  const routesContent = readFile(redwoodPaths.web.routes).toString();
  let newRoutes = (0, _filter.default)(routes).call(routes, route => !routesContent.match(route));
  if (newRoutes.length) {
    const [routerStart, routerParams, newLineAndIndent] = routesContent.match(/\s*<Router(.*?)>(\s*)/s);
    if (/trailingSlashes={?(["'])always\1}?/.test(routerParams)) {
      // newRoutes will be something like:
      // ['<Route path="/foo" page={FooPage} name="foo"/>']
      // and we need to replace `path="/foo"` with `path="/foo/"`
      newRoutes = (0, _map.default)(newRoutes).call(newRoutes, route => route.replace(/ path="(.+?)" /, ' path="$1/" '));
    }
    const routesBatch = layout ? wrapWithSet(routesContent, layout, newRoutes, newLineAndIndent, setProps) : newRoutes.join(newLineAndIndent);
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
  return 'Added scaffold import to App.{jsx,tsx}';
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

/**
 *
 * Use this util to install dependencies on a user's Redwood app
 *
 * @example addPackagesTask({
 * packages: ['fs-extra', 'somePackage@2.1.0'],
 * side: 'api', // <-- leave empty for project root
 * devDependency: true
 * })
 */
exports.removeRoutesFromRouterTask = removeRoutesFromRouterTask;
const addPackagesTask = ({
  packages,
  side = 'project',
  devDependency = false
}) => {
  const packagesWithSameRWVersion = (0, _map.default)(packages).call(packages, pkg => {
    if ((0, _includes.default)(pkg).call(pkg, '@redwoodjs')) {
      return `${pkg}@${getInstalledRedwoodVersion()}`;
    } else {
      return pkg;
    }
  });
  let installCommand;
  // if web,api
  if (side !== 'project') {
    var _context5;
    installCommand = ['yarn', (0, _filter.default)(_context5 = ['workspace', side, 'add', devDependency && '--dev', ...packagesWithSameRWVersion]).call(_context5, Boolean)];
  } else {
    var _context6, _context7;
    const stdout = (0, _child_process.execSync)('yarn --version');
    const yarnVersion = (0, _trim.default)(_context6 = stdout.toString()).call(_context6);
    installCommand = ['yarn', (0, _filter.default)(_context7 = [(0, _startsWith.default)(yarnVersion).call(yarnVersion, '1') && '-W', 'add', devDependency && '--dev', ...packagesWithSameRWVersion]).call(_context7, Boolean)];
  }
  return {
    title: `Adding dependencies to ${side}`,
    task: async () => {
      await (0, _execa.default)(...installCommand);
    }
  };
};
exports.addPackagesTask = addPackagesTask;
const runCommandTask = async (commands, {
  verbose
}) => {
  const tasks = new _listr.Listr((0, _map.default)(commands).call(commands, ({
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
    renderer: verbose && 'verbose',
    rendererOptions: {
      collapseSubtasks: false,
      dateFormat: false
    }
  });
  try {
    await tasks.run();
    return true;
  } catch (e) {
    console.log(_colors.default.error(e.message));
    return false;
  }
};

/** Extract default CLI args from an exported builder */
exports.runCommandTask = runCommandTask;
const getDefaultArgs = builder => {
  var _context8;
  return (0, _reduce.default)(_context8 = (0, _entries.default)(builder)).call(_context8, (options, [optionName, optionConfig]) => {
    // If a default is defined use it
    options[optionName] = optionConfig.default;
    return options;
  }, {});
};

/**
 * Check if user is using VS Code
 *
 * i.e. check for the existence of .vscode folder in root project directory
 */
exports.getDefaultArgs = getDefaultArgs;
const usingVSCode = () => {
  const redwoodPaths = getPaths();
  const VS_CODE_PATH = _path.default.join(redwoodPaths.base, '.vscode');
  return _fsExtra.default.existsSync(VS_CODE_PATH);
};
exports.usingVSCode = usingVSCode;
const printSetupNotes = notes => {
  return {
    title: 'One more thing...',
    task: (_ctx, task) => {
      task.title = `One more thing...\n\n ${(0, _boxen.default)(notes.join('\n'), {
        padding: {
          top: 1,
          bottom: 1,
          right: 1,
          left: 1
        },
        margin: 1,
        borderColour: 'gray'
      })}  \n`;
    }
  };
};
exports.printSetupNotes = printSetupNotes;