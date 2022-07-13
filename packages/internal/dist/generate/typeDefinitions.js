"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.mirrorPathForDirectoryNamedModules = exports.mirrorPathForCell = exports.generateTypeDefs = exports.generateTypeDefTestMocks = exports.generateTypeDefScenarios = exports.generateTypeDefRouterRoutes = exports.generateTypeDefRouterPages = exports.generateTypeDefGlobalContext = exports.generateTypeDefGlobImports = exports.generateTypeDefCurrentUser = exports.generateMirrorDirectoryNamedModules = exports.generateMirrorDirectoryNamedModule = exports.generateMirrorCells = exports.generateMirrorCell = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _flat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/flat"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _ast = require("../ast");

var _files = require("../files");

var _gql = require("../gql");

var _jsx = require("../jsx");

var _paths = require("../paths");

var _graphqlCodeGen = require("./graphqlCodeGen");

var _templates = require("./templates");

// TODO:
// Common return format for CLI output:
// ['type', 'relative path to base']
// Note for contributors:
//
// The functions in this file generate type definitions of which there are two types:
//
// 1. Mirror types: Create a virtual directory that allows us to type
// cells and directory named modules.
// 2. Types based on contents of other files
//
// When generating a new type definition that targets a particular side,
// you must prefix the generated filename
// with "web-" or "api-" to target inclusion for that side,
// or use "all-" for both. This is controlled by the user's "tsconfig.json"
// file.

/**
 * Generate all the types for a RedwoodJS project
 * and return the generated path to files, so they're logged
 */
const generateTypeDefs = async () => {
  // Return all the paths so they can be printed
  const gqlApi = await (0, _graphqlCodeGen.generateTypeDefGraphQLApi)();
  const gqlWeb = await (0, _graphqlCodeGen.generateTypeDefGraphQLWeb)();
  return [...generateMirrorDirectoryNamedModules(), ...generateMirrorCells(), ...generateTypeDefRouterPages(), ...generateTypeDefCurrentUser(), ...generateTypeDefRouterRoutes(), ...generateTypeDefGlobImports(), ...generateTypeDefGlobalContext(), ...generateTypeDefScenarios(), ...generateTypeDefTestMocks(), ...gqlApi, ...gqlWeb];
};

exports.generateTypeDefs = generateTypeDefs;

const generateMirrorDirectoryNamedModules = () => {
  var _context;

  const rwjsPaths = (0, _paths.getPaths)();
  return (0, _map.default)(_context = (0, _files.findDirectoryNamedModules)()).call(_context, p => generateMirrorDirectoryNamedModule(p, rwjsPaths));
};

exports.generateMirrorDirectoryNamedModules = generateMirrorDirectoryNamedModules;

const mirrorPathForDirectoryNamedModules = (p, rwjsPaths = (0, _paths.getPaths)()) => {
  return [_path.default.join(rwjsPaths.generated.types.mirror, _path.default.relative(rwjsPaths.base, _path.default.dirname(p))), 'index.d.ts'];
};

exports.mirrorPathForDirectoryNamedModules = mirrorPathForDirectoryNamedModules;

const generateMirrorDirectoryNamedModule = (p, rwjsPaths = (0, _paths.getPaths)()) => {
  const [mirrorDir, typeDef] = mirrorPathForDirectoryNamedModules(p, rwjsPaths);

  _fs.default.mkdirSync(mirrorDir, {
    recursive: true
  });

  const typeDefPath = _path.default.join(mirrorDir, typeDef);

  const {
    name
  } = _path.default.parse(p);

  (0, _templates.writeTemplate)('templates/mirror-directoryNamedModule.d.ts.template', typeDefPath, {
    name
  });
  return typeDefPath;
};

exports.generateMirrorDirectoryNamedModule = generateMirrorDirectoryNamedModule;

const generateMirrorCells = () => {
  var _context2;

  const rwjsPaths = (0, _paths.getPaths)();
  return (0, _map.default)(_context2 = (0, _files.findCells)()).call(_context2, p => generateMirrorCell(p, rwjsPaths));
};

exports.generateMirrorCells = generateMirrorCells;

const mirrorPathForCell = (p, rwjsPaths = (0, _paths.getPaths)()) => {
  const mirrorDir = _path.default.join(rwjsPaths.generated.types.mirror, _path.default.relative(rwjsPaths.base, _path.default.dirname(p)));

  _fs.default.mkdirSync(mirrorDir, {
    recursive: true
  });

  return [mirrorDir, 'index.d.ts'];
};

exports.mirrorPathForCell = mirrorPathForCell;

const generateMirrorCell = (p, rwjsPaths = (0, _paths.getPaths)()) => {
  const [mirrorDir, typeDef] = mirrorPathForCell(p, rwjsPaths);

  _fs.default.mkdirSync(mirrorDir, {
    recursive: true
  });

  const typeDefPath = _path.default.join(mirrorDir, typeDef);

  const {
    name
  } = _path.default.parse(p);

  const fileContents = (0, _ast.fileToAst)(p);
  const cellQuery = (0, _ast.getCellGqlQuery)(fileContents);

  if (cellQuery) {
    const gqlDoc = (0, _gql.parseGqlQueryToAst)(cellQuery)[0];
    (0, _templates.writeTemplate)('templates/mirror-cell.d.ts.template', typeDefPath, {
      name,
      queryResultType: `${gqlDoc === null || gqlDoc === void 0 ? void 0 : gqlDoc.name}`,
      queryVariablesType: `${gqlDoc === null || gqlDoc === void 0 ? void 0 : gqlDoc.name}Variables`
    });
  } else {
    // If for some reason we can't parse the query, generated the mirror cell anyway
    (0, _templates.writeTemplate)('templates/mirror-cell.d.ts.template', typeDefPath, {
      name,
      queryResultType: 'any',
      queryVariablesType: 'any'
    });
  }

  return typeDefPath;
};

exports.generateMirrorCell = generateMirrorCell;

const writeTypeDefIncludeFile = (template, values = {}) => {
  const rwjsPaths = (0, _paths.getPaths)();

  const typeDefPath = _path.default.join((0, _includes.default)(rwjsPaths.generated.types), template.replace('.template', ''));

  const templateFilename = _path.default.join('templates', template);

  (0, _templates.writeTemplate)(templateFilename, typeDefPath, values);
  return [typeDefPath];
};

const generateTypeDefRouterRoutes = () => {
  var _context3;

  const ast = (0, _ast.fileToAst)((0, _paths.getPaths)().web.routes);
  const routes = (0, _filter.default)(_context3 = (0, _jsx.getJsxElements)(ast, 'Route')).call(_context3, x => {
    var _x$props, _x$props2;

    // All generated "routes" should have a "name" and "path" prop-value
    return typeof ((_x$props = x.props) === null || _x$props === void 0 ? void 0 : _x$props.path) !== 'undefined' && typeof ((_x$props2 = x.props) === null || _x$props2 === void 0 ? void 0 : _x$props2.name) !== 'undefined';
  });
  return writeTypeDefIncludeFile('web-routerRoutes.d.ts.template', {
    routes
  });
};

exports.generateTypeDefRouterRoutes = generateTypeDefRouterRoutes;

const generateTypeDefRouterPages = () => {
  const pages = (0, _paths.processPagesDir)();
  return writeTypeDefIncludeFile('web-routesPages.d.ts.template', {
    pages
  });
};

exports.generateTypeDefRouterPages = generateTypeDefRouterPages;

const generateTypeDefCurrentUser = () => {
  return writeTypeDefIncludeFile('all-currentUser.d.ts.template');
};

exports.generateTypeDefCurrentUser = generateTypeDefCurrentUser;

const generateTypeDefScenarios = () => {
  return writeTypeDefIncludeFile('api-scenarios.d.ts.template');
};

exports.generateTypeDefScenarios = generateTypeDefScenarios;

const generateTypeDefTestMocks = () => {
  var _context4;

  return (0, _flat.default)(_context4 = [writeTypeDefIncludeFile('api-test-globals.d.ts.template'), writeTypeDefIncludeFile('web-test-globals.d.ts.template')]).call(_context4);
};

exports.generateTypeDefTestMocks = generateTypeDefTestMocks;

const generateTypeDefGlobImports = () => {
  return writeTypeDefIncludeFile('api-globImports.d.ts.template');
};

exports.generateTypeDefGlobImports = generateTypeDefGlobImports;

const generateTypeDefGlobalContext = () => {
  return writeTypeDefIncludeFile('api-globalContext.d.ts.template');
};

exports.generateTypeDefGlobalContext = generateTypeDefGlobalContext;