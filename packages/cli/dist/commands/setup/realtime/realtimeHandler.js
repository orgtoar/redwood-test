"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = handler;
require("core-js/modules/esnext.json.parse.js");
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _generate = require("@redwoodjs/internal/dist/generate/generate");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _project = require("../../../lib/project");
var _serverFileHandler = require("../server-file/serverFileHandler");
const {
  version
} = JSON.parse(_fsExtra.default.readFileSync(_path.default.resolve(__dirname, '../../../../package.json'), 'utf-8'));
async function handler({
  force,
  includeExamples,
  verbose
}) {
  const redwoodPaths = (0, _lib.getPaths)();
  const ts = (0, _project.isTypeScriptProject)();
  const realtimeLibFilePath = _path.default.join(redwoodPaths.api.lib, `realtime.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
  const tasks = new _listr.Listr([(0, _cliHelpers.addApiPackages)(['ioredis@^5', `@redwoodjs/realtime@${version}`]), {
    title: 'Adding the realtime api lib ...',
    task: () => {
      const serverFileTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'realtime.ts.template'), 'utf-8');
      const setupScriptContent = ts ? serverFileTemplateContent : (0, _lib.transformTSToJS)(realtimeLibFilePath, serverFileTemplateContent);
      return [(0, _lib.writeFile)(realtimeLibFilePath, setupScriptContent, {
        overwriteExisting: force
      })];
    }
  }, {
    title: 'Adding Countdown example subscription ...',
    enabled: () => includeExamples,
    task: () => {
      const exampleSubscriptionTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'subscriptions', 'countdown', `countdown.ts.template`), 'utf-8');
      const exampleFile = _path.default.join(redwoodPaths.api.subscriptions, 'countdown', `countdown.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const setupScriptContent = ts ? exampleSubscriptionTemplateContent : (0, _lib.transformTSToJS)(exampleFile, exampleSubscriptionTemplateContent);
      return [(0, _lib.writeFile)(exampleFile, setupScriptContent, {
        overwriteExisting: force
      })];
    }
  }, {
    title: 'Adding NewMessage example subscription ...',
    enabled: () => includeExamples,
    task: () => {
      // sdl

      const exampleSdlTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'subscriptions', 'newMessage', `rooms.sdl.ts.template`), 'utf-8');
      const sdlFile = _path.default.join(redwoodPaths.api.graphql, `rooms.sdl.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const sdlContent = ts ? exampleSdlTemplateContent : (0, _lib.transformTSToJS)(sdlFile, exampleSdlTemplateContent);

      // service

      const exampleServiceTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'subscriptions', 'newMessage', `rooms.ts.template`), 'utf-8');
      const serviceFile = _path.default.join(redwoodPaths.api.services, 'rooms', `rooms.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const serviceContent = ts ? exampleServiceTemplateContent : (0, _lib.transformTSToJS)(serviceFile, exampleServiceTemplateContent);

      // subscription

      const exampleSubscriptionTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'subscriptions', 'newMessage', `newMessage.ts.template`), 'utf-8');
      const exampleFile = _path.default.join(redwoodPaths.api.subscriptions, 'newMessage', `newMessage.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const setupScriptContent = ts ? exampleSubscriptionTemplateContent : (0, _lib.transformTSToJS)(exampleFile, exampleSubscriptionTemplateContent);

      // write all files
      return [(0, _lib.writeFile)(sdlFile, sdlContent, {
        overwriteExisting: force
      }), (0, _lib.writeFile)(serviceFile, serviceContent, {
        overwriteExisting: force
      }), (0, _lib.writeFile)(exampleFile, setupScriptContent, {
        overwriteExisting: force
      })];
    }
  }, {
    title: 'Adding Auctions example live query ...',
    enabled: () => includeExamples,
    task: () => {
      // sdl

      const exampleSdlTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'liveQueries', 'auctions', `auctions.sdl.ts.template`), 'utf-8');
      const sdlFile = _path.default.join(redwoodPaths.api.graphql, `auctions.sdl.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const sdlContent = ts ? exampleSdlTemplateContent : (0, _lib.transformTSToJS)(sdlFile, exampleSdlTemplateContent);

      // service

      const exampleServiceTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'liveQueries', 'auctions', `auctions.ts.template`), 'utf-8');
      const serviceFile = _path.default.join(redwoodPaths.api.services, 'auctions', `auctions.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const serviceContent = ts ? exampleServiceTemplateContent : (0, _lib.transformTSToJS)(serviceFile, exampleServiceTemplateContent);

      // write all files
      return [(0, _lib.writeFile)(sdlFile, sdlContent, {
        overwriteExisting: force
      }), (0, _lib.writeFile)(serviceFile, serviceContent, {
        overwriteExisting: force
      })];
    }
  }, {
    title: 'Adding Defer example queries ...',
    enabled: () => includeExamples,
    task: () => {
      // sdl

      const exampleSdlTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'defer', 'fastAndSlowFields', `fastAndSlowFields.sdl.template`), 'utf-8');
      const sdlFile = _path.default.join(redwoodPaths.api.graphql, `fastAndSlowFields.sdl.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const sdlContent = ts ? exampleSdlTemplateContent : (0, _lib.transformTSToJS)(sdlFile, exampleSdlTemplateContent);

      // service

      const exampleServiceTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'defer', 'fastAndSlowFields', `fastAndSlowFields.ts.template`), 'utf-8');
      const serviceFile = _path.default.join(redwoodPaths.api.services, 'fastAndSlowFields', `fastAndSlowFields.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const serviceContent = ts ? exampleServiceTemplateContent : (0, _lib.transformTSToJS)(serviceFile, exampleServiceTemplateContent);

      // write all files
      return [(0, _lib.writeFile)(sdlFile, sdlContent, {
        overwriteExisting: force
      }), (0, _lib.writeFile)(serviceFile, serviceContent, {
        overwriteExisting: force
      })];
    }
  }, {
    title: 'Adding Stream example queries ...',
    enabled: () => includeExamples,
    task: () => {
      // sdl

      const exampleSdlTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'stream', 'alphabet', `alphabet.sdl.template`), 'utf-8');
      const sdlFile = _path.default.join(redwoodPaths.api.graphql, `alphabet.sdl.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const sdlContent = ts ? exampleSdlTemplateContent : (0, _lib.transformTSToJS)(sdlFile, exampleSdlTemplateContent);

      // service

      const exampleServiceTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'stream', 'alphabet', `alphabet.ts.template`), 'utf-8');
      const serviceFile = _path.default.join(redwoodPaths.api.services, 'alphabet', `alphabet.${(0, _project.isTypeScriptProject)() ? 'ts' : 'js'}`);
      const serviceContent = ts ? exampleServiceTemplateContent : (0, _lib.transformTSToJS)(serviceFile, exampleServiceTemplateContent);

      // write all files
      return [(0, _lib.writeFile)(sdlFile, sdlContent, {
        overwriteExisting: force
      }), (0, _lib.writeFile)(serviceFile, serviceContent, {
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
    if (!(0, _project.serverFileExists)()) {
      tasks.add((0, _serverFileHandler.setupServerFileTasks)({
        force
      }));
    }
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
}