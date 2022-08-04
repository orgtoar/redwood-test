"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.verifyServerConfig = exports.verifyConfig = exports.throwMissingConfig = exports.serverConfigWithDefaults = exports.rollbackTasks = exports.parseConfig = exports.maintenanceTasks = exports.lifecycleTask = exports.handler = exports.execaOptions = exports.description = exports.deployTasks = exports.commands = exports.commandWithLifecycleEvents = exports.command = exports.builder = exports.DEFAULT_SERVER_CONFIG = void 0;

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));

var _flat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/flat"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _toml = _interopRequireDefault(require("@iarna/toml"));

var _boxen = _interopRequireDefault(require("boxen"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _titleCase = require("title-case");

var _lib = require("../../lib");

var _colors = _interopRequireDefault(require("../../lib/colors"));

const CONFIG_FILENAME = 'deploy.toml';
const SYMLINK_FLAGS = '-nsf';
const CURRENT_RELEASE_SYMLINK_NAME = 'current';
const LIFECYCLE_HOOKS = ['before', 'after'];
const DEFAULT_SERVER_CONFIG = {
  branch: 'main',
  packageManagerCommand: 'yarn',
  monitorCommand: 'pm2',
  sides: ['api', 'web'],
  keepReleases: 5
};
exports.DEFAULT_SERVER_CONFIG = DEFAULT_SERVER_CONFIG;
const command = 'baremetal [environment]';
exports.command = command;
const description = 'Deploy to baremetal server(s)';
exports.description = description;
const execaOptions = {
  cwd: _path.default.join((0, _lib.getPaths)().base),
  stdio: 'inherit',
  shell: true,
  cleanup: true
};
exports.execaOptions = execaOptions;

const builder = yargs => {
  yargs.positional('environment', {
    describe: 'The environment to deploy to',
    type: 'string'
  });
  yargs.option('first-run', {
    describe: 'Set this flag the first time you deploy: starts server processes from scratch',
    default: false,
    type: 'boolean'
  });
  yargs.option('update', {
    describe: 'Update code to latest revision',
    default: true,
    type: 'boolean'
  });
  yargs.option('install', {
    describe: 'Run `yarn install`',
    default: true,
    type: 'boolean'
  });
  yargs.option('migrate', {
    describe: 'Run database migration tasks',
    default: true,
    type: 'boolean'
  });
  yargs.option('build', {
    describe: 'Run build process for the deployed `sides`',
    default: true,
    type: 'boolean'
  });
  yargs.option('restart', {
    describe: 'Restart server processes',
    default: true,
    type: 'boolean'
  });
  yargs.option('cleanup', {
    describe: 'Remove old deploy directories',
    default: true,
    type: 'boolean'
  });
  yargs.option('releaseDir', {
    describe: 'Directory to create for the latest release, defaults to timestamp',
    default: new Date().toISOString().replace(/[:\-TZ]/g, '').replace(/\.\d+$/, ''),
    type: 'string'
  });
  yargs.option('branch', {
    describe: 'The branch to deploy',
    type: 'string'
  });
  yargs.option('maintenance', {
    describe: 'Add/remove the maintenance page',
    choices: ['up', 'down'],
    help: 'Put up a maintenance page by replacing the content of web/dist/index.html with the content of web/src/maintenance.html'
  });
  yargs.option('rollback', {
    describe: 'Add/remove the maintenance page',
    help: 'Rollback [count] number of releases'
  }); // TODO: Allow option to pass --sides and only deploy select sides instead of all, always

  yargs.epilogue(`Also see the ${(0, _terminalLink.default)('Redwood Baremetal Deploy Reference', 'https://redwoodjs.com/docs/cli-commands#deploy')}\n`);
}; // Executes a single command via SSH connection. Displays an error and will
// exit() with the same code returned from the SSH command.


exports.builder = builder;

const sshExec = async (ssh, path, command, args) => {
  let sshCommand = command;

  if (args) {
    sshCommand += ` ${args.join(' ')}`;
  }

  const result = await ssh.execCommand(sshCommand, {
    cwd: path
  });

  if (result.code !== 0) {
    console.error(_colors.default.error(`\nDeploy failed!`));
    console.error(_colors.default.error(`Error while running command \`${command} ${args.join(' ')}\`:`));
    console.error((0, _boxen.default)(result.stderr, {
      padding: {
        top: 0,
        bottom: 0,
        right: 1,
        left: 1
      },
      margin: 0,
      borderColor: 'red'
    }));
    process.exit(result.code);
  }

  return result;
};

const throwMissingConfig = name => {
  throw new Error(`"${name}" config option not set. See https://redwoodjs.com/docs/deployment/baremetal#deploytoml`);
};

exports.throwMissingConfig = throwMissingConfig;

const verifyConfig = (config, yargs) => {
  if (!yargs.environment) {
    throw new Error('Must specify an environment to deploy to, ex: `yarn rw deploy baremetal production`');
  }

  if (!config[yargs.environment]) {
    throw new Error(`No servers found for environment "${yargs.environment}"`);
  }

  return true;
};

exports.verifyConfig = verifyConfig;

const verifyServerConfig = config => {
  if (!config.host) {
    throwMissingConfig('host');
  }

  if (!config.path) {
    throwMissingConfig('path');
  }

  if (!config.repo) {
    throwMissingConfig('repo');
  }

  return true;
};

exports.verifyServerConfig = verifyServerConfig;

const symlinkCurrentCommand = async (dir, ssh, path) => {
  return await sshExec(ssh, path, 'ln', [SYMLINK_FLAGS, dir, CURRENT_RELEASE_SYMLINK_NAME]);
};

const restartProcessCommand = async (processName, ssh, serverConfig, path) => {
  return await sshExec(ssh, path, serverConfig.monitorCommand, ['restart', processName]);
};

const serverConfigWithDefaults = (serverConfig, yargs) => {
  return { ...DEFAULT_SERVER_CONFIG,
    ...serverConfig,
    branch: yargs.branch || serverConfig.branch || DEFAULT_SERVER_CONFIG.branch
  };
};

exports.serverConfigWithDefaults = serverConfigWithDefaults;

const maintenanceTasks = (status, ssh, serverConfig) => {
  const deployPath = _path.default.join(serverConfig.path, CURRENT_RELEASE_SYMLINK_NAME);

  const tasks = [];

  if (status === 'up') {
    tasks.push({
      title: `Enabling maintenance page...`,
      task: async () => {
        await sshExec(ssh, deployPath, 'cp', [_path.default.join('web', 'dist', '200.html'), _path.default.join('web', 'dist', '200.html.orig')]);
        await sshExec(ssh, deployPath, 'ln', [SYMLINK_FLAGS, _path.default.join('..', 'src', 'maintenance.html'), _path.default.join('web', 'dist', '200.html')]);
      }
    });

    if (serverConfig.processNames) {
      tasks.push({
        title: `Stopping ${serverConfig.processNames.join(', ')} processes...`,
        task: async () => {
          await sshExec(ssh, serverConfig.path, serverConfig.monitorCommand, ['stop', serverConfig.processNames.join(' ')]);
        }
      });
    }
  } else if (status === 'down') {
    tasks.push({
      title: `Starting ${serverConfig.processNames.join(', ')} processes...`,
      task: async () => {
        await sshExec(ssh, serverConfig.path, serverConfig.monitorCommand, ['start', serverConfig.processNames.join(' ')]);
      }
    });

    if (serverConfig.processNames) {
      tasks.push({
        title: `Disabling maintenance page...`,
        task: async () => {
          await sshExec(ssh, deployPath, 'rm', [_path.default.join('web', 'dist', '200.html')]);
          await sshExec(ssh, deployPath, 'cp', [_path.default.join('web', 'dist', '200.html.orig'), _path.default.join('web', 'dist', '200.html')]);
        }
      });
    }
  }

  return tasks;
};

exports.maintenanceTasks = maintenanceTasks;

const rollbackTasks = (count, ssh, serverConfig) => {
  let rollbackCount = 1;

  if ((0, _parseInt2.default)(count) === count) {
    rollbackCount = count;
  }

  const tasks = [{
    title: `Rolling back ${rollbackCount} release(s)...`,
    task: async () => {
      var _context;

      const currentLink = (await sshExec(ssh, serverConfig.path, 'readlink', ['-f', 'current'])).stdout.split('/').pop();
      const dirs = (0, _filter.default)(_context = (await sshExec(ssh, serverConfig.path, 'ls', ['-t'])).stdout.split('\n')).call(_context, dirs => !dirs.match(/current/));
      const deployedIndex = (0, _indexOf.default)(dirs).call(dirs, currentLink);
      const rollbackIndex = deployedIndex + rollbackCount;

      if (dirs[rollbackIndex]) {
        console.info('Setting symlink');
        await symlinkCurrentCommand(dirs[rollbackIndex], ssh, serverConfig.path);
      } else {
        throw new Error(`Cannot rollback ${rollbackCount} release(s): ${dirs.length - (0, _indexOf.default)(dirs).call(dirs, currentLink) - 1} previous release(s) available`);
      }
    }
  }];

  if (serverConfig.processNames) {
    for (const processName of serverConfig.processNames) {
      tasks.push({
        title: `Restarting ${processName} process...`,
        task: async () => {
          await restartProcessCommand(processName, ssh, serverConfig, serverConfig.path);
        }
      });
    }
  }

  return tasks;
};

exports.rollbackTasks = rollbackTasks;

const lifecycleTask = (lifecycle, task, skip, {
  serverLifecycle,
  ssh,
  cmdPath
}) => {
  var _serverLifecycle$life;

  if ((_serverLifecycle$life = serverLifecycle[lifecycle]) !== null && _serverLifecycle$life !== void 0 && _serverLifecycle$life[task]) {
    const tasks = [];

    for (const command of serverLifecycle[lifecycle][task]) {
      tasks.push({
        title: `${(0, _titleCase.titleCase)(lifecycle)} ${task}: \`${command}\``,
        task: async () => {
          await sshExec(ssh, cmdPath, command);
        },
        skip: () => skip
      });
    }

    return tasks;
  }
}; // wraps a given command with any defined before/after lifecycle commands


exports.lifecycleTask = lifecycleTask;

const commandWithLifecycleEvents = ({
  name,
  config,
  skip,
  command
}) => {
  var _context2;

  const tasks = [];
  tasks.push(lifecycleTask('before', name, skip, config));
  tasks.push({ ...command,
    skip: () => skip
  });
  tasks.push(lifecycleTask('after', name, skip, config));
  return (0, _filter.default)(_context2 = (0, _flat.default)(tasks).call(tasks)).call(_context2, t => t);
};

exports.commandWithLifecycleEvents = commandWithLifecycleEvents;

const deployTasks = (yargs, ssh, serverConfig, serverLifecycle) => {
  var _context3;

  const cmdPath = _path.default.join(serverConfig.path, yargs.releaseDir);

  const config = {
    yargs,
    ssh,
    serverConfig,
    serverLifecycle,
    cmdPath
  };
  const tasks = [];
  tasks.push(commandWithLifecycleEvents({
    name: 'update',
    config: { ...config,
      cmdPath: serverConfig.path
    },
    skip: !yargs.update,
    command: {
      title: `Cloning \`${serverConfig.branch}\` branch...`,
      task: async () => {
        await sshExec(ssh, serverConfig.path, 'git', ['clone', `--branch=${serverConfig.branch}`, `--depth=1`, serverConfig.repo, yargs.releaseDir]);
      }
    }
  }));
  tasks.push(commandWithLifecycleEvents({
    name: 'symlinkEnv',
    config,
    skip: !yargs.update,
    command: {
      title: `Symlink .env...`,
      task: async () => {
        await sshExec(ssh, cmdPath, 'ln', [SYMLINK_FLAGS, '../.env', '.env']);
      }
    }
  }));
  tasks.push(commandWithLifecycleEvents({
    name: 'install',
    config,
    skip: !yargs.install,
    command: {
      title: `Installing dependencies...`,
      task: async () => {
        await sshExec(ssh, cmdPath, serverConfig.packageManagerCommand, ['install']);
      }
    }
  }));
  tasks.push(commandWithLifecycleEvents({
    name: 'migrate',
    config,
    skip: !yargs.migrate || (serverConfig === null || serverConfig === void 0 ? void 0 : serverConfig.migrate) === false,
    command: {
      title: `DB Migrations...`,
      task: async () => {
        await sshExec(ssh, cmdPath, serverConfig.packageManagerCommand, ['rw', 'prisma', 'migrate', 'deploy']);
        await sshExec(ssh, cmdPath, serverConfig.packageManagerCommand, ['rw', 'prisma', 'generate']);
        await sshExec(ssh, cmdPath, serverConfig.packageManagerCommand, ['rw', 'dataMigrate', 'up']);
      }
    }
  }));

  for (const side of serverConfig.sides) {
    tasks.push(commandWithLifecycleEvents({
      name: 'build',
      config,
      skip: !yargs.build,
      command: {
        title: `Building ${side}...`,
        task: async () => {
          await sshExec(ssh, cmdPath, serverConfig.packageManagerCommand, ['rw', 'build', side]);
        }
      }
    }));
  }

  tasks.push(commandWithLifecycleEvents({
    name: 'symlinkCurrent',
    config,
    skip: !yargs.update,
    command: {
      title: `Symlinking current release...`,
      task: async () => {
        await symlinkCurrentCommand(yargs.releaseDir, ssh, serverConfig.path);
      },
      skip: () => !yargs.update
    }
  }));

  if (serverConfig.processNames) {
    for (const processName of serverConfig.processNames) {
      if (yargs.firstRun) {
        tasks.push(commandWithLifecycleEvents({
          name: 'restart',
          config,
          skip: !yargs.restart,
          command: {
            title: `Starting ${processName} process for the first time...`,
            task: async () => {
              await sshExec(ssh, serverConfig.path, serverConfig.monitorCommand, ['start', _path.default.join(CURRENT_RELEASE_SYMLINK_NAME, 'ecosystem.config.js'), '--only', processName]);
            }
          }
        }));
        tasks.push({
          title: `Saving ${processName} state for future startup...`,
          task: async () => {
            await sshExec(ssh, serverConfig.path, serverConfig.monitorCommand, ['save']);
          },
          skip: () => !yargs.restart
        });
      } else {
        tasks.push(commandWithLifecycleEvents({
          name: 'restart',
          config,
          skip: !yargs.restart,
          command: {
            title: `Restarting ${processName} process...`,
            task: async () => {
              await restartProcessCommand(processName, ssh, serverConfig, serverConfig.path);
            }
          }
        }));
      }
    }
  }

  tasks.push(commandWithLifecycleEvents({
    name: 'cleanup',
    config: { ...config,
      cmdPath: serverConfig.path
    },
    skip: !yargs.cleanup,
    command: {
      title: `Cleaning up old deploys...`,
      task: async () => {
        // add 2 to skip `current` and start on the keepReleases + 1th release
        const fileStartIndex = serverConfig.keepReleases + 2;
        await sshExec(ssh, serverConfig.path, `ls -t | tail -n +${fileStartIndex} | xargs rm -rf`);
      }
    }
  }));
  return (0, _filter.default)(_context3 = (0, _flat.default)(tasks).call(tasks)).call(_context3, e => e);
}; // merges additional lifecycle events into an existing object


exports.deployTasks = deployTasks;

const mergeLifecycleEvents = (lifecycle, other) => {
  let lifecycleCopy = JSON.parse((0, _stringify.default)(lifecycle));

  for (const hook of LIFECYCLE_HOOKS) {
    for (const key in other[hook]) {
      var _context4;

      lifecycleCopy[hook][key] = (0, _concat.default)(_context4 = lifecycleCopy[hook][key] || []).call(_context4, other[hook][key]);
    }
  }

  return lifecycleCopy;
};

const parseConfig = (yargs, configToml) => {
  const config = _toml.default.parse(configToml);

  let envConfig;
  const emptyLifecycle = {};
  verifyConfig(config, yargs); // start with an emtpy set of hooks, { before: {}, after: {} }

  for (const hook of LIFECYCLE_HOOKS) {
    emptyLifecycle[hook] = {};
  } // global lifecycle config


  let envLifecycle = mergeLifecycleEvents(emptyLifecycle, config); // get config for given environment

  envConfig = config[yargs.environment];
  envLifecycle = mergeLifecycleEvents(envLifecycle, envConfig);
  return {
    envConfig,
    envLifecycle
  };
};

exports.parseConfig = parseConfig;

const commands = (yargs, ssh) => {
  const deployConfig = _fs.default.readFileSync(_path.default.join((0, _lib.getPaths)().base, CONFIG_FILENAME)).toString();

  let {
    envConfig,
    envLifecycle
  } = parseConfig(yargs, deployConfig);
  let servers = [];
  let tasks = []; // loop through each server in deploy.toml

  for (const config of envConfig.servers) {
    // merge in defaults
    const serverConfig = serverConfigWithDefaults(config, yargs);
    verifyServerConfig(serverConfig); // server-specific lifecycle

    const serverLifecycle = mergeLifecycleEvents(envLifecycle, serverConfig);
    tasks.push({
      title: 'Connecting...',
      task: () => ssh.connect({
        host: serverConfig.host,
        username: serverConfig.username,
        password: serverConfig.password,
        privateKey: serverConfig.privateKey,
        passphrase: serverConfig.passphrase,
        agent: serverConfig.agentForward && process.env.SSH_AUTH_SOCK,
        agentForward: serverConfig.agentForward
      })
    });

    if (yargs.maintenance) {
      tasks = (0, _concat.default)(tasks).call(tasks, maintenanceTasks(yargs.maintenance, ssh, serverConfig));
    } else if (yargs.rollback) {
      tasks = (0, _concat.default)(tasks).call(tasks, rollbackTasks(yargs.rollback, ssh, serverConfig));
    } else {
      tasks = (0, _concat.default)(tasks).call(tasks, deployTasks(yargs, ssh, serverConfig, serverLifecycle));
    }

    tasks.push({
      title: 'Disconnecting...',
      task: () => ssh.dispose()
    }); // Sets each server as a "parent" task so that the actual deploy tasks
    // run as children. Each server deploy can run concurrently

    servers.push({
      title: serverConfig.host,
      task: () => {
        return new _listr.default(tasks);
      }
    });
  }

  return servers;
};

exports.commands = commands;

const handler = async yargs => {
  const {
    NodeSSH
  } = require('node-ssh');

  const ssh = new NodeSSH();

  try {
    const tasks = new _listr.default(commands(yargs, ssh), {
      concurrent: true,
      exitOnError: true,
      renderer: yargs.verbose && _listrVerboseRenderer.default
    });
    await tasks.run();
  } catch (e) {
    console.error(_colors.default.error('\nDeploy failed:'));
    console.error((0, _boxen.default)(e.stderr || e.message, {
      padding: {
        top: 0,
        bottom: 0,
        right: 1,
        left: 1
      },
      margin: 0,
      borderColor: 'red'
    }));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;