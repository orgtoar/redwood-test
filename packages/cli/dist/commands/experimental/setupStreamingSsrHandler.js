"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../lib");
var _colors = _interopRequireDefault(require("../../lib/colors"));
var _project = require("../../lib/project");
var _setupStreamingSsr = require("./setupStreamingSsr");
var _util = require("./util");
const handler = async ({
  force,
  verbose
}) => {
  const rwPaths = (0, _lib.getPaths)();
  const redwoodTomlPath = (0, _projectConfig.getConfigPath)();
  const configContent = _fsExtra.default.readFileSync(redwoodTomlPath, 'utf-8');
  const ts = (0, _project.isTypeScriptProject)();
  const ext = _path.default.extname(rwPaths.web.entryClient || '');
  const tasks = new _listr.Listr([{
    title: 'Check prerequisites',
    task: () => {
      if (!rwPaths.web.entryClient || !rwPaths.web.viteConfig) {
        throw new Error('Vite needs to be setup before you can enable Streaming SSR');
      }
    }
  }, {
    title: 'Adding config to redwood.toml...',
    task: (_ctx, task) => {
      if (!(0, _includes.default)(configContent).call(configContent, '[experimental.streamingSsr]')) {
        (0, _lib.writeFile)(redwoodTomlPath, (0, _concat.default)(configContent).call(configContent, `\n[experimental.streamingSsr]\n  enabled = true\n`), {
          overwriteExisting: true // redwood.toml always exists
        });
      } else {
        if (force) {
          task.output = 'Overwriting config in redwood.toml';
          (0, _lib.writeFile)(redwoodTomlPath, configContent.replace(
          // Enable if it's currently disabled
          `\n[experimental.streamingSsr]\n  enabled = false\n`, `\n[experimental.streamingSsr]\n  enabled = true\n`), {
            overwriteExisting: true // redwood.toml always exists
          });
        } else {
          task.skip(`The [experimental.streamingSsr] config block already exists in your 'redwood.toml' file.`);
        }
      }
    },
    options: {
      persistentOutput: true
    }
  }, {
    title: `Adding entry.client${ext}...`,
    task: async (_ctx, task) => {
      const entryClientTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'streamingSsr', 'entry.client.tsx.template'), 'utf-8');
      let entryClientPath = rwPaths.web.entryClient;
      const entryClientContent = ts ? entryClientTemplate : (0, _lib.transformTSToJS)(entryClientPath, entryClientTemplate);
      let overwriteExisting = force;
      if (!force) {
        overwriteExisting = await task.prompt({
          type: 'Confirm',
          message: `Overwrite ${entryClientPath}?`
        });
        if (!overwriteExisting) {
          entryClientPath = entryClientPath.replace(ext, `.new${ext}`);
          task.output = `File will be written to ${entryClientPath}\n` + `You'll manually need to merge it with your existing entry.client${ext} file.`;
        }
      }
      (0, _lib.writeFile)(entryClientPath, entryClientContent, {
        overwriteExisting
      });
    },
    options: {
      persistentOutput: true
    }
  }, {
    title: `Adding entry.server${ext}...`,
    task: async () => {
      const entryServerTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'streamingSsr', 'entry.server.tsx.template'), 'utf-8');
      // Can't use rwPaths.web.entryServer because it might not be not created yet
      const entryServerPath = _path.default.join(rwPaths.web.src, `entry.server${ext}`);
      const entryServerContent = ts ? entryServerTemplate : (0, _lib.transformTSToJS)(entryServerPath, entryServerTemplate);
      (0, _lib.writeFile)(entryServerPath, entryServerContent, {
        overwriteExisting: force
      });
    }
  }, {
    title: `Adding Document${ext}...`,
    task: async () => {
      const documentTemplate = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'streamingSsr', 'Document.tsx.template'), 'utf-8');
      const documentPath = _path.default.join(rwPaths.web.src, `Document${ext}`);
      const documentContent = ts ? documentTemplate : (0, _lib.transformTSToJS)(documentPath, documentTemplate);
      (0, _lib.writeFile)(documentPath, documentContent, {
        overwriteExisting: force
      });
    }
  }, (0, _cliHelpers.addWebPackages)(['@apollo/experimental-nextjs-app-support@0.0.0-commit-b8a73fe']), {
    task: () => {
      (0, _util.printTaskEpilogue)(_setupStreamingSsr.command, _setupStreamingSsr.description, _setupStreamingSsr.EXPERIMENTAL_TOPIC_ID);
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
};
exports.handler = handler;