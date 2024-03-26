"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = handler;
var _path = _interopRequireDefault(require("path"));
var _camelcase = _interopRequireDefault(require("camelcase"));
var _listr = require("listr2");
var _pascalcase = _interopRequireDefault(require("pascalcase"));
var _pluralize = _interopRequireWildcard(require("pluralize"));
var _prompts = _interopRequireDefault(require("prompts"));
var _generate = require("@redwoodjs/internal/dist/generate/generate");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _project = require("../../../lib/project");
var _util = require("../../experimental/util.js");
// Move this check out of experimental when server file is moved as well

const templateVariables = name => {
  name = (0, _pluralize.singular)(name.toLowerCase());
  return {
    name,
    collectionName: (0, _pluralize.default)(name),
    pluralName: (0, _pluralize.default)(name),
    pluralPascalName: (0, _pascalcase.default)((0, _pluralize.default)(name)),
    camelName: (0, _camelcase.default)(name),
    functionName: (0, _camelcase.default)(name),
    liveQueryName: `recent${(0, _pascalcase.default)((0, _pluralize.default)(name))}`,
    subscriptionQueryName: `recent${(0, _pascalcase.default)((0, _pluralize.default)(name))}`,
    subscriptionName: `listenTo${(0, _pascalcase.default)(name)}Channel`,
    modelName: (0, _pascalcase.default)(name),
    typeName: (0, _pascalcase.default)(name),
    channelName: `${(0, _pascalcase.default)(name)}Channel`,
    subscriptionInputType: `Publish${(0, _pascalcase.default)(name)}Input`,
    subscriptionServiceResolver: `publishTo${(0, _pascalcase.default)(name)}Channel`
  };
};
async function handler({
  name,
  type,
  force,
  verbose
}) {
  const redwoodPaths = (0, _lib.getPaths)();
  const ts = (0, _project.isTypeScriptProject)();
  name = (0, _pluralize.singular)(name.toLowerCase());
  let functionType = type;

  // Prompt to select what type if not specified
  if (!functionType) {
    const response = await (0, _prompts.default)({
      type: 'select',
      name: 'functionType',
      choices: [{
        value: 'liveQuery',
        title: 'Live Query',
        description: 'Create a Live Query to watch for changes in data'
      }, {
        value: 'subscription',
        title: 'Subscription',
        description: 'Create a Subscription to watch for events'
      }],
      message: 'What type of realtime event would you like to create?'
    });
    functionType = response.functionType;
  }
  const tasks = new _listr.Listr([{
    title: 'Checking for realtime environment prerequisites ...',
    task: () => {
      (0, _util.isServerFileSetup)() && (0, _util.isRealtimeSetup)();
    }
  }, {
    title: `Adding ${name} example subscription ...`,
    enabled: () => functionType === 'subscription',
    task: () => {
      // sdl

      const exampleSdlTemplateContent = _path.default.resolve(__dirname, 'templates', 'subscriptions', 'blank', `blank.sdl.ts.template`);
      const sdlFile = _path.default.join(redwoodPaths.api.graphql, `${name}.sdl.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const sdlContent = ts ? exampleSdlTemplateContent : (0, _lib.transformTSToJS)(sdlFile, exampleSdlTemplateContent);

      // service

      const exampleServiceTemplateContent = _path.default.resolve(__dirname, 'templates', 'subscriptions', 'blank', `blank.service.ts.template`);
      const serviceFile = _path.default.join(redwoodPaths.api.services, `${name}`, `${name}.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const serviceContent = ts ? exampleServiceTemplateContent : (0, _lib.transformTSToJS)(serviceFile, exampleServiceTemplateContent);

      // subscription

      const exampleSubscriptionTemplateContent = _path.default.resolve(__dirname, 'templates', 'subscriptions', 'blank', `blank.ts.template`);
      const exampleFile = _path.default.join(redwoodPaths.api.subscriptions, `${name}`, `${name}.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const setupScriptContent = ts ? exampleSubscriptionTemplateContent : (0, _lib.transformTSToJS)(exampleFile, exampleSubscriptionTemplateContent);

      // write all files
      return [(0, _lib.writeFile)(sdlFile, (0, _lib.generateTemplate)(sdlContent, templateVariables(name)), {
        overwriteExisting: force
      }), (0, _lib.writeFile)(serviceFile, (0, _lib.generateTemplate)(serviceContent, templateVariables(name)), {
        overwriteExisting: force
      }), (0, _lib.writeFile)(exampleFile, (0, _lib.generateTemplate)(setupScriptContent, templateVariables(name)), {
        overwriteExisting: force
      })];
    }
  }, {
    title: `Adding ${name} example live query ...`,
    enabled: () => functionType === 'liveQuery',
    task: () => {
      // sdl
      const exampleSdlTemplateContent = _path.default.resolve(__dirname, 'templates', 'liveQueries', 'blank', `blank.sdl.ts.template`);
      const sdlFile = _path.default.join(redwoodPaths.api.graphql, `${name}.sdl.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const sdlContent = ts ? exampleSdlTemplateContent : (0, _lib.transformTSToJS)(sdlFile, exampleSdlTemplateContent);

      // service
      const exampleServiceTemplateContent = _path.default.resolve(__dirname, 'templates', 'liveQueries', 'blank', 'blank.service.ts.template');
      const serviceFile = _path.default.join(redwoodPaths.api.services, `${name}`, `${name}.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const serviceContent = ts ? exampleServiceTemplateContent : (0, _lib.transformTSToJS)(serviceFile, exampleServiceTemplateContent);

      // write all files
      return [(0, _lib.writeFile)(sdlFile, (0, _lib.generateTemplate)(sdlContent, templateVariables(name)), {
        overwriteExisting: force
      }), (0, _lib.writeFile)(serviceFile, (0, _lib.generateTemplate)(serviceContent, templateVariables(name)), {
        overwriteExisting: force
      })];
    }
  }, {
    title: `Generating types ...`,
    task: async () => {
      await (0, _generate.generate)();
      console.log('Note: You may need to manually restart GraphQL in VSCode to see the new types take effect.\n\n');
    }
  }], {
    rendererOptions: {
      collapseSubtasks: false,
      persistentOutput: true
    },
    renderer: verbose ? 'verbose' : 'default'
  });
  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
}