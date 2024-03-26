"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));
var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));
var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/splice"));
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../lib");
var _colors = _interopRequireDefault(require("../../lib/colors"));
var _project = require("../../lib/project");
var _setupOpentelemetry = require("./setupOpentelemetry");
var _util = require("./util");
const handler = async ({
  force,
  verbose
}) => {
  const ts = (0, _project.isTypeScriptProject)();

  // Used in multiple tasks
  const opentelemetryScriptPath = `${(0, _lib.getPaths)().api.src}/opentelemetry.${ts ? 'ts' : 'js'}`;

  // TODO: Consider extracting these from the templates? Consider version pinning?
  const opentelemetryPackages = ['@opentelemetry/api', '@opentelemetry/instrumentation', '@opentelemetry/exporter-trace-otlp-http', '@opentelemetry/resources', '@opentelemetry/sdk-node', '@opentelemetry/semantic-conventions', '@opentelemetry/instrumentation-http', '@opentelemetry/instrumentation-fastify', '@prisma/instrumentation'];
  const opentelemetryTasks = [{
    title: `Adding OpenTelemetry setup files...`,
    task: () => {
      const setupTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'opentelemetry.ts.template'), 'utf-8');
      const setupScriptContent = ts ? setupTemplateContent : (0, _lib.transformTSToJS)(opentelemetryScriptPath, setupTemplateContent);
      return [(0, _lib.writeFile)(opentelemetryScriptPath, setupScriptContent, {
        overwriteExisting: force
      })];
    }
  }, {
    title: 'Adding config to redwood.toml...',
    task: (_ctx, task) => {
      const redwoodTomlPath = (0, _projectConfig.getConfigPath)();
      const configContent = _fsExtra.default.readFileSync(redwoodTomlPath, 'utf-8');
      if (!(0, _includes.default)(configContent).call(configContent, '[experimental.opentelemetry]')) {
        // Use string replace to preserve comments and formatting
        (0, _lib.writeFile)(redwoodTomlPath, (0, _concat.default)(configContent).call(configContent, `\n[experimental.opentelemetry]\n\tenabled = true\n\twrapApi = true`), {
          overwriteExisting: true // redwood.toml always exists
        });
      } else {
        task.skip(`The [experimental.opentelemetry] config block already exists in your 'redwood.toml' file.`);
      }
    }
  }, {
    title: 'Notice: GraphQL function update...',
    enabled: () => {
      return _fsExtra.default.existsSync((0, _projectConfig.resolveFile)(_path.default.join((0, _lib.getPaths)().api.functions, 'graphql')));
    },
    task: (_ctx, task) => {
      task.output = ["Please add the following to your 'createGraphQLHandler' function options to enable OTel for your graphql", 'openTelemetryOptions: {', '  resolvers: true,', '  result: true,', '  variables: true,', '}', '', `Which can found at ${_colors.default.info(_path.default.join((0, _lib.getPaths)().api.functions, 'graphql'))}`].join('\n');
    },
    options: {
      persistentOutput: true
    }
  }, {
    title: 'Notice: GraphQL function update (server file)...',
    enabled: () => {
      return _fsExtra.default.existsSync((0, _projectConfig.resolveFile)(_path.default.join((0, _lib.getPaths)().api.src, 'server')));
    },
    task: (_ctx, task) => {
      task.output = ["Please add the following to your 'redwoodFastifyGraphQLServer' plugin options to enable OTel for your graphql", 'openTelemetryOptions: {', '  resolvers: true,', '  result: true,', '  variables: true,', '}', '', `Which can found at ${_colors.default.info(_path.default.join((0, _lib.getPaths)().api.src, 'server'))}`].join('\n');
    },
    options: {
      persistentOutput: true
    }
  }, (0, _cliHelpers.addApiPackages)(opentelemetryPackages)];
  const prismaTasks = [{
    title: 'Setup Prisma OpenTelemetry...',
    task: (_ctx, task) => {
      var _context;
      const schemaPath = _path.default.join((0, _lib.getPaths)().api.db, 'schema.prisma'); // TODO: schema file is already in getPaths()?
      const schemaContent = _fsExtra.default.readFileSync(schemaPath, {
        encoding: 'utf-8',
        flag: 'r'
      });
      const clientConfig = (0, _trim.default)(_context = (0, _slice.default)(schemaContent).call(schemaContent, (0, _indexOf.default)(schemaContent).call(schemaContent, 'generator client') + 'generator client'.length, (0, _indexOf.default)(schemaContent).call(schemaContent, '}', (0, _indexOf.default)(schemaContent).call(schemaContent, 'generator client')) + 1)).call(_context);
      const previewLineExists = (0, _includes.default)(clientConfig).call(clientConfig, 'previewFeatures');
      let newSchemaContents = schemaContent;
      if (previewLineExists) {
        task.skip('Please add "tracing" to your previewFeatures in prisma.schema');
      } else {
        const newClientConfig = (0, _trim.default)(clientConfig).call(clientConfig).split('\n');
        (0, _splice.default)(newClientConfig).call(newClientConfig, newClientConfig.length - 1, 0, 'previewFeatures = ["tracing"]');
        newSchemaContents = newSchemaContents.replace(clientConfig, newClientConfig.join('\n'));
      }
      return (0, _lib.writeFile)(schemaPath, newSchemaContents, {
        overwriteExisting: true // We'll likely always already have this file in the project
      });
    }
  }, {
    title: 'Regenerate the Prisma client...',
    task: (_ctx, _task) => {
      return (0, _execa.default)(`yarn rw prisma generate`, {
        stdio: 'inherit',
        shell: true,
        cwd: (0, _lib.getPaths)().web.base
      });
    }
  }];
  const tasks = new _listr.Listr([{
    title: 'Confirmation',
    task: async (_ctx, task) => {
      const confirmation = await task.prompt({
        type: 'Confirm',
        message: 'OpenTelemetry support is experimental. Continue?'
      });
      if (!confirmation) {
        throw new Error('User aborted');
      }
    }
  }, ...opentelemetryTasks, ...prismaTasks, {
    task: () => {
      (0, _util.printTaskEpilogue)(_setupOpentelemetry.command, _setupOpentelemetry.description, _setupOpentelemetry.EXPERIMENTAL_TOPIC_ID);
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