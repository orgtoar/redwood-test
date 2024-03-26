"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = handler;
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _execa = _interopRequireDefault(require("execa"));
var _listr = require("listr2");
var _prettier = require("prettier");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
var _runTransform = require("../fragments/runTransform.js");
async function handler({
  force
}) {
  const tasks = new _listr.Listr([{
    title: 'Update Redwood Project Configuration to enable GraphQL Trusted Documents ...',
    skip: () => {
      if (force) {
        // Never skip when --force is used
        return false;
      }
      const config = (0, _projectConfig.getConfig)();
      if (config.graphql.trustedDocuments) {
        return 'GraphQL Trusted Documents are already enabled in your Redwood project.';
      }
      return false;
    },
    task: () => {
      (0, _cliHelpers.setTomlSetting)('graphql', 'trustedDocuments', true);
    }
  }, {
    title: 'Generating Trusted Documents store ...',
    task: () => {
      _execa.default.commandSync('yarn redwood generate types', {
        stdio: 'ignore'
      });
    }
  }, {
    title: 'Configuring the GraphQL Handler to use a Trusted Documents store ...',
    task: async () => {
      const graphqlPath = (0, _projectConfig.resolveFile)(_nodePath.default.join((0, _projectConfig.getPaths)().api.functions, 'graphql'));
      if (!graphqlPath) {
        throw new Error('Could not find a GraphQL handler in your project.');
      }
      const transformResult = await (0, _runTransform.runTransform)({
        transformPath: _nodePath.default.join(__dirname, 'graphqlTransform.js'),
        targetPaths: [graphqlPath]
      });
      if (transformResult.error) {
        throw new Error(transformResult.error);
      }
      const source = _nodeFs.default.readFileSync(graphqlPath, 'utf-8');
      const prettierOptions = await (0, _cliHelpers.getPrettierOptions)();
      const prettifiedApp = await (0, _prettier.format)(source, {
        ...prettierOptions,
        parser: 'babel-ts'
      });
      _nodeFs.default.writeFileSync(graphqlPath, prettifiedApp, 'utf-8');
    }
  }], {
    rendererOptions: {
      collapseSubtasks: false
    }
  });
  try {
    await tasks.run();
  } catch (e) {
    console.error(e.message);
    process.exit(e?.exitCode || 1);
  }
}