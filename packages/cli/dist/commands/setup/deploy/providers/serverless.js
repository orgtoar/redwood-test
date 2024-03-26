"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.notes = exports.handler = exports.description = exports.command = exports.aliases = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../../lib");
var _colors = _interopRequireDefault(require("../../../../lib/colors"));
var _helpers = require("../helpers");
var _api = require("../templates/serverless/api");
var _web = require("../templates/serverless/web");
// import terminalLink from 'terminal-link'

const command = exports.command = 'serverless';
const description = exports.description = '[DEPRECATED]\n' + 'Setup Serverless Framework AWS deploy\n' + 'For more information:\n' + 'https://redwoodjs.com/docs/deploy/serverless';
const aliases = exports.aliases = ['aws-serverless'];
const notes = exports.notes = [_colors.default.error('DEPRECATED option not officially supported'), '', 'For more information:', 'https://redwoodjs.com/docs/deploy/serverless', '', '', _colors.default.green("You're almost ready to deploy using the Serverless framework!"), '', '• See https://redwoodjs.com/docs/deploy#serverless-deploy for more info. If you ', '  want to give it a shot, open your `.env` file and add your AWS credentials,', '  then run: ', '', '    yarn rw deploy serverless --first-run', '', '  For subsequent deploys you can just run `yarn rw deploy serverless`.', '', '• If you want to use the Serverless Dashboard to manage your app, plug in', '  the values for `org` and `app` in `web/serverless.yml` and `api/serverless.yml`', '', "• If you haven't already, familiarize yourself with the docs for your", '  preferred provider: https://www.serverless.com/framework/docs/providers'];
const projectDevPackages = ['serverless', 'serverless-lift', '@vercel/nft', 'archiver', 'fs-extra'];
const files = [{
  path: _path.default.join((0, _lib.getPaths)().api.base, 'serverless.yml'),
  content: _api.SERVERLESS_API_YML
}, {
  path: _path.default.join((0, _lib.getPaths)().web.base, 'serverless.yml'),
  content: _web.SERVERLESS_WEB_YML
}];
const prismaBinaryTargetAdditions = () => {
  const content = _fsExtra.default.readFileSync((0, _lib.getPaths)().api.dbSchema).toString();
  if (!(0, _includes.default)(content).call(content, 'rhel-openssl-1.0.x')) {
    const result = content.replace(/binaryTargets =.*\n/, `binaryTargets = ["native", "rhel-openssl-1.0.x"]\n`);
    _fsExtra.default.writeFileSync((0, _lib.getPaths)().api.dbSchema, result);
  }
};

// updates the api_url to use an environment variable.
const updateRedwoodTomlTask = () => {
  return {
    title: 'Updating redwood.toml apiUrl...',
    task: () => {
      const configPath = _path.default.join((0, _lib.getPaths)().base, 'redwood.toml');
      const content = _fsExtra.default.readFileSync(configPath).toString();
      const newContent = content.replace(/apiUrl.*?\n/m, 'apiUrl = "${API_URL:/api}"       # Set API_URL in production to the Serverless deploy endpoint of your api service, see https://redwoodjs.com/docs/deploy/serverless-deploy\n');
      _fsExtra.default.writeFileSync(configPath, newContent);
    }
  };
};
const handler = async ({
  force
}) => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup deploy serverless',
    force
  });
  const [serverless, serverlessLift, ...rest] = projectDevPackages;
  const tasks = new _listr.Listr([(0, _lib.addPackagesTask)({
    packages: [serverless, ...rest],
    devDependency: true
  }), (0, _lib.addPackagesTask)({
    packages: [serverless, serverlessLift],
    side: 'web',
    devDependency: true
  }), (0, _lib.addPackagesTask)({
    packages: [serverless],
    side: 'api',
    devDependency: true
  }), (0, _helpers.addFilesTask)({
    files,
    force
  }), updateRedwoodTomlTask(), (0, _helpers.addToGitIgnoreTask)({
    paths: ['.serverless']
  }), (0, _helpers.addToDotEnvTask)({
    lines: ['AWS_ACCESS_KEY_ID=<your-key-here>', 'AWS_SECRET_ACCESS_KEY=<your-secret-key-here>']
  }), {
    title: 'Adding necessary Prisma binaries...',
    task: () => prismaBinaryTargetAdditions()
  }, (0, _lib.printSetupNotes)(notes)], {
    exitOnError: true,
    rendererOptions: {
      collapseSubtasks: false
    }
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