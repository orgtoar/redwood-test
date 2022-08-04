"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPageFile = exports.isGraphQLSchemaFile = exports.isFileInsideFolder = exports.isDirectoryNamedModuleFile = exports.isCellFile = exports.isApiFunction = exports.findWebFiles = exports.findScripts = exports.findPrerenderedHtml = exports.findPages = exports.findGraphQLSchemas = exports.findDirectoryNamedModules = exports.findCells = exports.findApiServerFunctions = exports.findApiFiles = exports.findApiDistFunctions = void 0;

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _ast = require("./ast");

var _paths = require("./paths");

const findCells = (cwd = (0, _paths.getPaths)().web.src) => {
  const modules = _fastGlob.default.sync('**/*Cell.{js,jsx,ts,tsx}', {
    cwd,
    absolute: true,
    ignore: ['node_modules']
  });

  return modules.filter(isCellFile);
};

exports.findCells = findCells;

const findPages = (cwd = (0, _paths.getPaths)().web.pages) => {
  const modules = _fastGlob.default.sync('**/*Page.{tsx,js,jsx}', {
    cwd,
    absolute: true,
    ignore: ['node_modules']
  });

  return modules.filter(isPageFile);
};

exports.findPages = findPages;

const findDirectoryNamedModules = (cwd = (0, _paths.getPaths)().base) => {
  const modules = _fastGlob.default.sync('**/src/**/*.{ts,js,jsx,tsx}', {
    cwd,
    absolute: true,
    ignore: ['node_modules']
  }); // Cell's also follow use the directory-named-module pattern,
  // but they get their own special type mirror file, so ignore them.


  return modules.filter(isDirectoryNamedModuleFile).filter(p => !isCellFile(p));
};

exports.findDirectoryNamedModules = findDirectoryNamedModules;

const findGraphQLSchemas = (cwd = (0, _paths.getPaths)().api.graphql) => {
  return _fastGlob.default.sync('**/*.sdl.{ts,js}', {
    cwd,
    absolute: true
  }).filter(isGraphQLSchemaFile);
};

exports.findGraphQLSchemas = findGraphQLSchemas;
const ignoreApiFiles = ['**/*.test.{js,ts}', '**/*.scenarios.{js,ts}', '**/*.fixtures.{js,ts}', '**/*.d.ts'];

const findApiFiles = (cwd = (0, _paths.getPaths)().api.src) => {
  const files = _fastGlob.default.sync('**/*.{js,ts}', {
    cwd,
    absolute: true,
    ignore: ignoreApiFiles
  });

  return files;
};

exports.findApiFiles = findApiFiles;

const findWebFiles = (cwd = (0, _paths.getPaths)().web.src) => {
  const files = _fastGlob.default.sync('**/*.{js,ts,jsx,tsx}', {
    cwd,
    absolute: true,
    ignore: ['**/*.test.{js,ts,tsx,jsx}', '**/*.fixtures.{js,ts,tsx,jsx}', '**/*.mock.{js,ts,tsx,jsx}', '**/*.d.ts']
  });

  return files;
};

exports.findWebFiles = findWebFiles;

const findApiServerFunctions = (cwd = (0, _paths.getPaths)().api.functions) => {
  const files = _fastGlob.default.sync('**/*.{js,ts}', {
    cwd,
    absolute: true,
    deep: 2,
    // We don't support deeply nested api functions.
    ignore: ignoreApiFiles
  });

  return files.filter(f => isApiFunction(f, cwd));
};

exports.findApiServerFunctions = findApiServerFunctions;

const findApiDistFunctions = (cwd = (0, _paths.getPaths)().api.base) => {
  return _fastGlob.default.sync('dist/functions/**/*.{ts,js}', {
    cwd,
    deep: 2,
    // We don't support deeply nested api functions, to maximise compatibility with deployment providers
    absolute: true
  });
};

exports.findApiDistFunctions = findApiDistFunctions;

const findPrerenderedHtml = (cwd = (0, _paths.getPaths)().web.dist) => _fastGlob.default.sync('**/*.html', {
  cwd,
  ignore: ['200.html', '404.html']
});

exports.findPrerenderedHtml = findPrerenderedHtml;

const isCellFile = p => {
  const {
    dir,
    name
  } = _path.default.parse(p); // If the path isn't on the web side it cannot be a cell


  if (!isFileInsideFolder(p, (0, _paths.getPaths)().web.src)) {
    return false;
  } // A Cell must be a directory named module.


  if (!dir.endsWith(name)) {
    return false;
  }

  const ast = (0, _ast.fileToAst)(p); // A Cell should not have a default export.

  if ((0, _ast.hasDefaultExport)(ast)) {
    return false;
  } // A Cell must export QUERY and Success.


  const exports = (0, _ast.getNamedExports)(ast);
  const exportedQUERY = exports.findIndex(v => v.name === 'QUERY') !== -1;
  const exportedSuccess = exports.findIndex(v => v.name === 'Success') !== -1;

  if (!exportedQUERY && !exportedSuccess) {
    return false;
  }

  return true;
};

exports.isCellFile = isCellFile;

const findScripts = (cwd = (0, _paths.getPaths)().scripts) => {
  return _fastGlob.default.sync('*.{js,jsx,ts,tsx}', {
    cwd,
    absolute: true,
    ignore: ['node_modules']
  });
};

exports.findScripts = findScripts;

const isPageFile = p => {
  const {
    name
  } = _path.default.parse(p); // A page must end with "Page.{jsx,js,tsx}".


  if (!name.endsWith('Page')) {
    return false;
  } // A page should be in the `web/src/pages` directory.


  if (!isFileInsideFolder(p, (0, _paths.getPaths)().web.pages)) {
    return false;
  } // A Page should have a default export.


  const ast = (0, _ast.fileToAst)(p);

  if (!(0, _ast.hasDefaultExport)(ast)) {
    return false;
  }

  return true;
};

exports.isPageFile = isPageFile;

const isDirectoryNamedModuleFile = p => {
  const {
    dir,
    name
  } = _path.default.parse(p);

  return dir.endsWith(name);
};

exports.isDirectoryNamedModuleFile = isDirectoryNamedModuleFile;

const isGraphQLSchemaFile = p => {
  var _p$match;

  if (!((_p$match = p.match(/\.sdl\.(ts|js)$/)) !== null && _p$match !== void 0 && _p$match[0])) {
    return false;
  }

  const ast = (0, _ast.fileToAst)(p);
  const exports = (0, _ast.getNamedExports)(ast);
  return exports.findIndex(v => v.name === 'schema') !== -1;
};
/**
 * The following patterns are supported for api functions:
 *
 * 1. a module at the top level: `/graphql.js`
 * 2. a module in a folder with a module of the same name: `/health/health.js`
 * 3. a module in a folder named index: `/x/index.js`
 */


exports.isGraphQLSchemaFile = isGraphQLSchemaFile;

const isApiFunction = (p, functionsPath) => {
  p = _path.default.relative(functionsPath, p);

  const {
    dir,
    name
  } = _path.default.parse(p);

  if (dir === name) {
    // Directory named module
    return true;
  } else if (dir === '') {
    // Module in the functions root
    return true;
  } else if (dir.length && name === 'index') {
    // Directory with an `index.js` file
    return true;
  }

  return false;
};

exports.isApiFunction = isApiFunction;

const isFileInsideFolder = (filePath, folderPath) => {
  const {
    dir
  } = _path.default.parse(filePath);

  const relativePathFromFolder = _path.default.relative(folderPath, dir);

  if (!relativePathFromFolder || relativePathFromFolder.startsWith('..') || _path.default.isAbsolute(relativePathFromFolder)) {
    return false;
  } else {
    return true;
  }
};

exports.isFileInsideFolder = isFileInsideFolder;