#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _chokidar = _interopRequireDefault(require("chokidar"));

var _files = require("../files");

var _paths = require("../paths");

var _generate = require("./generate");

var _graphqlCodeGen = require("./graphqlCodeGen");

var _graphqlSchema = require("./graphqlSchema");

var _typeDefinitions = require("./typeDefinitions");

const rwjsPaths = (0, _paths.getPaths)();

const watcher = _chokidar.default.watch('**/src/**/*.{ts,js,jsx,tsx}', {
  persistent: true,
  ignored: ['node_modules', '.redwood'],
  ignoreInitial: true,
  cwd: rwjsPaths.base,
  awaitWriteFinish: true
});

const action = {
  add: 'Created',
  unlink: 'Deleted',
  change: 'Modified'
};
watcher.on('ready', async () => {
  console.log('Generating TypeScript definitions and GraphQL schemas...');
  const files = await (0, _generate.generate)();
  console.log(files.length, 'files generated');
}).on('all', async (eventName, p) => {
  var _context;

  if (!(0, _includes.default)(_context = ['add', 'change', 'unlink']).call(_context, eventName)) {
    return;
  }

  eventName = eventName;

  const absPath = _path.default.join(rwjsPaths.base, p);

  if ((0, _indexOf.default)(absPath).call(absPath, 'Cell') !== -1 && (0, _files.isCellFile)(absPath)) {
    await (0, _graphqlCodeGen.generateTypeDefGraphQLWeb)();

    if (eventName === 'unlink') {
      _fs.default.unlinkSync((0, _typeDefinitions.mirrorPathForCell)(absPath, rwjsPaths)[0]);
    } else {
      (0, _typeDefinitions.generateMirrorCell)(absPath, rwjsPaths);
    }

    console.log(action[eventName], 'Cell:', '\x1b[2m', p, '\x1b[0m');
  } else if (absPath === rwjsPaths.web.routes) {
    (0, _typeDefinitions.generateTypeDefRouterRoutes)();
    console.log(action[eventName], 'Routes:', '\x1b[2m', p, '\x1b[0m');
  } else if ((0, _indexOf.default)(absPath).call(absPath, 'Page') !== -1 && (0, _files.isPageFile)(absPath)) {
    (0, _typeDefinitions.generateTypeDefRouterPages)();
    console.log(action[eventName], 'Page:', '\x1b[2m', p, '\x1b[0m');
  } else if ((0, _files.isDirectoryNamedModuleFile)(absPath)) {
    if (eventName === 'unlink') {
      _fs.default.unlinkSync((0, _typeDefinitions.mirrorPathForDirectoryNamedModules)(absPath, rwjsPaths)[0]);
    } else {
      (0, _typeDefinitions.generateMirrorDirectoryNamedModule)(absPath, rwjsPaths);
    }

    console.log(action[eventName], 'Directory named module:', '\x1b[2m', p, '\x1b[0m');
  } else if ((0, _files.isGraphQLSchemaFile)(absPath)) {
    await (0, _graphqlSchema.generateGraphQLSchema)();
    await (0, _graphqlCodeGen.generateTypeDefGraphQLApi)();
    console.log(action[eventName], 'GraphQL Schema:', '\x1b[2m', p, '\x1b[0m');
  }
});