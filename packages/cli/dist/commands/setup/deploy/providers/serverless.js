"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.notes = exports.handler = exports.description = exports.command = exports.aliases = void 0;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../../lib");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

var _helpers = require("../helpers");

var _api = require("../templates/serverless/api");

var _web = require("../templates/serverless/web");

// import terminalLink from 'terminal-link'
const command = 'serverless';
exports.command = command;
const description = 'Setup deployments via the Serverless Framework';
exports.description = description;
const aliases = ['aws-serverless'];
exports.aliases = aliases;
const notes = [_colors.default.green("You're almost ready to deploy using the Serverless framework!"), '', '• See https://redwoodjs.com/docs/deploy#serverless-deploy for more info. If you ', '  want to give it a shot, open your `.env` file and add your AWS credentials,', '  then run: ', '', '    yarn rw deploy serverless --first-run', '', '  For subsequent deploys you can just run `yarn rw deploy serverless`.', '', '• If you want to use the Serverless Dashboard to manage your app, plug in', '  the values for `org` and `app` in `web/serverless.yml` and `api/serverless.yml`', '', "• If you haven't already, familiarize yourself with the docs for your", '  preferred provider: https://www.serverless.com/framework/docs/providers'];
exports.notes = notes;
const projectDevPackages = ['serverless', 'serverless-lift', '@vercel/nft', 'archiver', 'fs-extra'];
const files = [{
  path: _path.default.join((0, _lib.getPaths)().api.base, 'serverless.yml'),
  content: _api.SERVERLESS_API_YML
}, {
  path: _path.default.join((0, _lib.getPaths)().web.base, 'serverless.yml'),
  content: _web.SERVERLESS_WEB_YML
}];

const prismaBinaryTargetAdditions = () => {
  const content = _fs.default.readFileSync((0, _lib.getPaths)().api.dbSchema).toString();

  if (!(0, _includes.default)(content).call(content, 'rhel-openssl-1.0.x')) {
    const result = content.replace(/binaryTargets =.*\n/, `binaryTargets = ["native", "rhel-openssl-1.0.x"]\n`);

    _fs.default.writeFileSync((0, _lib.getPaths)().api.dbSchema, result);
  }
}; // updates the api_url to use an environment variable.


const updateRedwoodTomlTask = () => {
  return {
    title: 'Updating redwood.toml apiUrl...',
    task: () => {
      const configPath = _path.default.join((0, _lib.getPaths)().base, 'redwood.toml');

      const content = _fs.default.readFileSync(configPath).toString();

      const newContent = content.replace(/apiUrl.*?\n/m, 'apiUrl = "${API_URL:/api}"       # Set API_URL in production to the Serverless deploy endpoint of your api service, see https://redwoodjs.com/docs/deploy/serverless-deploy\n');

      _fs.default.writeFileSync(configPath, newContent);
    }
  };
};

const handler = async ({
  force
}) => {
  const [serverless, serverlessLift, ...rest] = projectDevPackages;
  const tasks = new _listr.default([(0, _helpers.addPackagesTask)({
    packages: [serverless, ...rest],
    devDependency: true
  }), (0, _helpers.addPackagesTask)({
    packages: [serverless, serverlessLift],
    side: 'web',
    devDependency: true
  }), (0, _helpers.addPackagesTask)({
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
  }, (0, _helpers.printSetupNotes)(notes)], {
    exitOnError: true
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