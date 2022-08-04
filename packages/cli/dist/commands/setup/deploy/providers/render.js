"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.getRenderYamlContent = exports.description = exports.command = exports.builder = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _sdk = require("@prisma/sdk");

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../../lib");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

var _helpers = require("../helpers");

var _render = require("../templates/render");

// import terminalLink from 'terminal-link'
const command = 'render';
exports.command = command;
const description = 'Setup Render deploy';
exports.description = description;

const getRenderYamlContent = async database => {
  if (database === 'none') {
    return {
      path: _path.default.join((0, _lib.getPaths)().base, 'render.yaml'),
      content: (0, _render.RENDER_YAML)('')
    };
  }

  if (!_fs.default.existsSync('api/db/schema.prisma')) {
    throw new Error("Could not find prisma schema at 'api/db/schema.prisma'");
  }

  const schema = await (0, _sdk.getSchema)('api/db/schema.prisma');
  const config = await (0, _sdk.getConfig)({
    datamodel: schema
  });
  const detectedDatabase = config.datasources[0].activeProvider;

  if (detectedDatabase === database) {
    switch (database) {
      case 'postgresql':
        return {
          path: _path.default.join((0, _lib.getPaths)().base, 'render.yaml'),
          content: (0, _render.RENDER_YAML)(_render.POSTGRES_YAML)
        };

      case 'sqlite':
        return {
          path: _path.default.join((0, _lib.getPaths)().base, 'render.yaml'),
          content: (0, _render.RENDER_YAML)(_render.SQLITE_YAML)
        };

      default:
        throw new Error(`
       Unexpected datasource provider found: ${database}`);
    }
  } else {
    throw new Error(`
    Prisma datasource provider is detected to be ${detectedDatabase}.

    Option 1: Update your schema.prisma provider to be ${database}, then run
    yarn rw prisma migrate dev
    yarn rw setup deploy render --database ${database}

    Option 2: Rerun setup deploy command with current schema.prisma provider:
    yarn rw setup deploy render --database ${detectedDatabase}`);
  }
};

exports.getRenderYamlContent = getRenderYamlContent;

const builder = yargs => yargs.option('database', {
  alias: 'd',
  choices: ['none', 'postgresql', 'sqlite'],
  description: 'Database deployment for Render only',
  default: 'postgresql',
  type: 'string'
}); // any notes to print out when the job is done


exports.builder = builder;
const notes = ['You are ready to deploy to Render!\n', 'Go to https://dashboard.render.com/iacs to create your account and deploy to Render', 'Check out the deployment docs at https://render.com/docs/deploy-redwood for detailed instructions', 'Note: After first deployment to Render update the rewrite rule destination in `./render.yaml`'];
const additionalFiles = [{
  path: _path.default.join((0, _lib.getPaths)().base, 'api/src/functions/healthz.js'),
  content: _render.RENDER_HEALTH_CHECK
}];

const handler = async ({
  force,
  database
}) => {
  const tasks = new _listr.default([{
    title: 'Adding render.yaml',
    task: async () => {
      const fileData = await getRenderYamlContent(database);
      let files = {};
      files[fileData.path] = fileData.content;
      return (0, _lib.writeFilesTask)(files, {
        overwriteExisting: force
      });
    }
  }, (0, _helpers.updateApiURLTask)('/.redwood/functions'), // Add health check api function
  (0, _helpers.addFilesTask)({
    files: additionalFiles,
    force
  }), (0, _helpers.printSetupNotes)(notes)]);

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;