"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preRequisites = exports.handler = exports.description = exports.deployCommands = exports.command = exports.builder = exports.buildCommands = exports.aliases = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _boxen = _interopRequireDefault(require("boxen"));

var _chalk = _interopRequireDefault(require("chalk"));

var _dotenvDefaults = require("dotenv-defaults");

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _prompts = _interopRequireDefault(require("prompts"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _lib = require("../../lib");

var _colors = _interopRequireDefault(require("../../lib/colors"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const command = 'serverless';
exports.command = command;
const aliases = ['aws serverless', 'sls'];
exports.aliases = aliases;
const description = 'Deploy to AWS via the serverless framework';
exports.description = description;

const builder = yargs => {
  yargs.option('stage', {
    describe: 'serverless stage pass through param: https://www.serverless.com/blog/stages-and-environments',
    default: 'production',
    type: 'string'
  });
  yargs.option('sides', {
    describe: 'which Side(s) to deploy',
    choices: ['api', 'web'],
    default: ['api', 'web'],
    alias: 'side',
    type: 'array'
  });
  yargs.option('verbose', {
    describe: 'verbosity of logs',
    default: true,
    type: 'boolean'
  });
  yargs.option('pack-only', {
    describe: 'Only build and pack, and dont push code up using serverless',
    default: false,
    type: 'boolean'
  });
  yargs.option('first-run', {
    describe: 'Set this flag the first time you deploy, to configure your API URL on the webside',
    default: false,
    type: 'boolean'
  });
  yargs.epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#deploy')}\n`);
};

exports.builder = builder;

const preRequisites = () => [{
  title: 'Checking if Serverless framework is installed...',
  command: ['yarn serverless', ['--version']],
  errorMessage: ['Looks like Serverless is not installed.', 'Please run yarn add -W --dev serverless.']
}];

exports.preRequisites = preRequisites;

const buildCommands = ({
  sides
}) => {
  return [{
    title: `Building ${sides.join(' & ')}...`,
    command: ['yarn', ['rw', 'build', ...sides]]
  }, {
    title: 'Packing Functions...',
    enabled: () => sides.includes('api'),
    task: async () => {
      // Dynamically import this function
      // because its dependencies are only installed when `rw setup deploy serverless` is run
      const {
        nftPack
      } = (await Promise.resolve().then(() => _interopRequireWildcard(require('./packing/nft')))).default;
      await nftPack();
    }
  }];
};

exports.buildCommands = buildCommands;

const deployCommands = ({
  stage,
  sides,
  firstRun,
  packOnly
}) => {
  const slsStage = stage ? ['--stage', stage] : [];
  return sides.map(side => {
    return {
      title: `Deploying ${side}....`,
      task: async () => {
        await (0, _execa.default)('yarn', ['serverless', 'deploy', ...slsStage], {
          cwd: _path.default.join((0, _lib.getPaths)().base, side),
          shell: true,
          stdio: 'inherit',
          cleanup: true
        });
      },
      skip: () => {
        if (firstRun && side === 'web') {
          return 'Skipping web deploy, until environment configured';
        }

        if (packOnly) {
          return 'Finishing early due to --pack-only flag. Your Redwood project is packaged and ready to deploy';
        }
      }
    };
  });
};

exports.deployCommands = deployCommands;

const loadDotEnvForStage = dotEnvPath => {
  // Make sure we use the correct .env based on the stage
  (0, _dotenvDefaults.config)({
    path: dotEnvPath,
    defaults: _path.default.join((0, _lib.getPaths)().base, '.env.defaults'),
    encoding: 'utf8'
  });
};

const handler = async yargs => {
  const rwjsPaths = (0, _lib.getPaths)();

  const dotEnvPath = _path.default.join(rwjsPaths.base, `.env.${yargs.stage}`); // Make sure .env.staging, .env.production, etc are loaded based on the --stage flag


  loadDotEnvForStage(dotEnvPath);
  const tasks = new _listr.default([...preRequisites(yargs).map(mapCommandsToListr), ...buildCommands(yargs).map(mapCommandsToListr), ...deployCommands(yargs).map(mapCommandsToListr)], {
    exitOnError: true,
    renderer: yargs.verbose && _listrVerboseRenderer.default
  });

  try {
    await tasks.run();

    if (yargs.firstRun) {
      const SETUP_MARKER = _chalk.default.bgBlue(_chalk.default.black('First Setup '));

      console.log();
      console.log(SETUP_MARKER, _colors.default.green('Starting first setup wizard...'));
      const {
        stdout: slsInfo
      } = await (0, _execa.default)(`yarn serverless info --verbose --stage=${yargs.stage}`, {
        shell: true,
        cwd: (0, _lib.getPaths)().api.base
      });
      const deployedApiUrl = slsInfo.match(/HttpApiUrl: (https:\/\/.*)/)[1];
      console.log();
      console.log(SETUP_MARKER, `Found ${_colors.default.green(deployedApiUrl)}`);
      console.log();
      const {
        addDotEnv
      } = await (0, _prompts.default)({
        type: 'confirm',
        name: 'addDotEnv',
        message: `Add API_URL to your .env.${yargs.stage}? This will be used if you deploy the web side from your machine`
      });

      if (addDotEnv) {
        _fs.default.writeFileSync(dotEnvPath, `API_URL=${deployedApiUrl}`); // Reload dotenv, after adding the new file


        loadDotEnvForStage(dotEnvPath);
      }

      if (yargs.sides.includes('web')) {
        console.log();
        console.log(SETUP_MARKER, 'Deploying web side with updated API_URL');
        console.log(SETUP_MARKER, 'First deploys can take a good few minutes...');
        console.log();
        const webDeployTasks = new _listr.default([// Rebuild web with the new API_URL
        ...buildCommands({ ...yargs,
          sides: ['web'],
          firstRun: false
        }).map(mapCommandsToListr), ...deployCommands({ ...yargs,
          sides: ['web'],
          firstRun: false
        }).map(mapCommandsToListr)], {
          exitOnError: true,
          renderer: yargs.verbose && _listrVerboseRenderer.default
        }); // Deploy the web side now that the API_URL has been configured

        await webDeployTasks.run();
        const {
          stdout: slsInfo
        } = await (0, _execa.default)(`yarn serverless info --verbose --stage=${yargs.stage}`, {
          shell: true,
          cwd: (0, _lib.getPaths)().web.base
        });
        const deployedWebUrl = slsInfo.match(/url: (https:\/\/.*)/)[1];
        const message = [_colors.default.bold('Successful first deploy!'), '', `View your deployed site at: ${_colors.default.green(deployedWebUrl)}`, '', 'You can use serverless.com CI/CD by connecting/creating an app', 'To do this run `yarn serverless` on each of the sides, and connect your account', '', 'Find more information in our docs:', _colors.default.underline('https://redwoodjs.com/docs/deploy#serverless')];
        console.log((0, _boxen.default)(message.join('\n'), {
          padding: {
            top: 0,
            bottom: 0,
            right: 1,
            left: 1
          },
          margin: 1,
          borderColor: 'gray'
        }));
      }
    }
  } catch (e) {
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;

const mapCommandsToListr = ({
  title,
  command,
  task,
  cwd,
  errorMessage,
  skip,
  enabled
}) => {
  return {
    title,
    task: task ? task : async () => {
      try {
        const executingCommand = (0, _execa.default)(...command, {
          cwd: cwd || (0, _lib.getPaths)().base,
          shell: true
        });
        executingCommand.stdout.pipe(process.stdout);
        await executingCommand;
      } catch (error) {
        if (errorMessage) {
          error.message = error.message + '\n' + errorMessage.join(' ');
        }

        throw error;
      }
    },
    skip,
    enabled
  };
};