"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.description = exports.command = void 0;
exports.handler = handler;
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _execa = _interopRequireDefault(require("execa"));
var _listr = require("listr2");
var _prettier = require("prettier");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
var _runTransform = require("./runTransform");
const command = exports.command = 'fragments';
const description = exports.description = 'Set up Fragments for GraphQL';
async function handler({
  force
}) {
  const tasks = new _listr.Listr([{
    title: 'Update Redwood Project Configuration to enable GraphQL Fragments',
    skip: () => {
      if (force) {
        // Never skip when --force is used
        return false;
      }
      const config = (0, _projectConfig.getConfig)();
      if (config.graphql.fragments) {
        return 'GraphQL Fragments are already enabled.';
      }
      return false;
    },
    task: () => {
      (0, _cliHelpers.setTomlSetting)('graphql', 'fragments', true);
    }
  }, {
    title: 'Generate possibleTypes.ts',
    task: () => {
      _execa.default.commandSync('yarn redwood generate types', {
        stdio: 'ignore'
      });
    }
  }, {
    title: 'Import possibleTypes in App.tsx',
    task: () => {
      return (0, _runTransform.runTransform)({
        transformPath: _nodePath.default.join(__dirname, 'appImportTransform.js'),
        targetPaths: [(0, _projectConfig.getPaths)().web.app]
      });
    }
  }, {
    title: 'Add possibleTypes to the GraphQL cache config',
    task: async () => {
      const transformResult = await (0, _runTransform.runTransform)({
        transformPath: _nodePath.default.join(__dirname, 'appGqlConfigTransform.js'),
        targetPaths: [(0, _projectConfig.getPaths)().web.app]
      });
      if (transformResult.error) {
        throw new Error(transformResult.error);
      }
      const appPath = (0, _projectConfig.getPaths)().web.app;
      const source = _nodeFs.default.readFileSync(appPath, 'utf-8');
      const prettierOptions = await (0, _cliHelpers.getPrettierOptions)();
      const prettifiedApp = (0, _prettier.format)(source, {
        ...prettierOptions,
        parser: 'babel-ts'
      });
      _nodeFs.default.writeFileSync((0, _projectConfig.getPaths)().web.app, prettifiedApp, 'utf-8');
    }
  }], {
    rendererOptions: {
      collapseSubtasks: false
    }
  });
  try {
    await tasks.run();
  } catch (e) {
    console.error(_cliHelpers.colors.error(e.message));
    process.exit(e?.exitCode || 1);
  }
}