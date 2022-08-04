"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateApiURLTask = exports.printSetupNotes = exports.preRequisiteCheckTask = exports.addToGitIgnoreTask = exports.addToDotEnvTask = exports.addPackagesTask = exports.addFilesTask = void 0;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.for-each.js");

require("core-js/modules/esnext.async-iterator.every.js");

require("core-js/modules/esnext.iterator.every.js");

var _child_process = require("child_process");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _boxen = _interopRequireDefault(require("boxen"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _lib = require("../../../../lib");

const REDWOOD_TOML_PATH = _path.default.join((0, _lib.getPaths)().base, 'redwood.toml');

const updateApiURLTask = apiUrl => {
  return {
    title: 'Updating API URL in redwood.toml...',
    task: () => {
      const redwoodToml = _fs.default.readFileSync(REDWOOD_TOML_PATH).toString();

      let newRedwoodToml = redwoodToml;

      if (redwoodToml.match(/apiUrl/)) {
        newRedwoodToml = newRedwoodToml.replace(/apiUrl.*/g, `apiUrl = "${apiUrl}"`);
      } else if (redwoodToml.match(/\[web\]/)) {
        newRedwoodToml = newRedwoodToml.replace(/\[web\]/, `[web]\n  apiUrl = "${apiUrl}"`);
      } else {
        newRedwoodToml += `[web]\n  apiUrl = "${apiUrl}"`;
      }

      _fs.default.writeFileSync(REDWOOD_TOML_PATH, newRedwoodToml);
    }
  };
};
/**
 * Use this to create checks prior to runnning setup commands
 * with a better error output
 *
 * @example preRequisiteCheckTask([
    {
      title: 'Checking if xxx is installed...',
      command: ['xxx', ['--version']],
      errorMessage: [
        'Looks like xxx.',
        'Please follow the steps...',
      ],
    },
  ])
 */


exports.updateApiURLTask = updateApiURLTask;

const preRequisiteCheckTask = preRequisites => {
  return {
    title: 'Checking pre-requisites',
    task: () => new _listr.default(preRequisites.map(preReq => {
      return {
        title: preReq.title,
        task: async () => {
          try {
            await (0, _execa.default)(...preReq.command);
          } catch (error) {
            error.message = error.message + '\n' + preReq.errorMessage;
            throw error;
          }
        }
      };
    }))
  };
};
/**
 *
 * Use this util to install dependencies on a user's Redwood app
 *
 * @example addPackagesTask({
 * packages: ['fs-extra', 'somePackage@2.1.0'],
 * side: 'api', // <-- leave empty for project root
 * devDependency: true
 * })
 */


exports.preRequisiteCheckTask = preRequisiteCheckTask;

const addPackagesTask = ({
  packages,
  side = 'project',
  devDependency = false
}) => {
  const packagesWithSameRWVersion = packages.map(pkg => {
    if (pkg.includes('@redwoodjs')) {
      return `${pkg}@${(0, _lib.getInstalledRedwoodVersion)()}`;
    } else {
      return pkg;
    }
  });
  let installCommand; // if web,api

  if (side !== 'project') {
    installCommand = ['yarn', ['workspace', side, 'add', devDependency && '--dev', ...packagesWithSameRWVersion].filter(Boolean)];
  } else {
    const stdout = (0, _child_process.execSync)('yarn --version');
    const yarnVersion = stdout.toString().trim();
    installCommand = ['yarn', [yarnVersion.startsWith('1') && '-W', 'add', devDependency && '--dev', ...packagesWithSameRWVersion].filter(Boolean)];
  }

  return {
    title: `Adding dependencies to ${side}`,
    task: async () => {
      await (0, _execa.default)(...installCommand);
    }
  };
};
/**
 *
 * Use this to add files to a users project
 *
 * @example
 * addFilesTask(
 *  files: [ { path: path.join(getPaths().base, 'netlify.toml'), content: NETLIFY_TOML }],
 * )
 */


exports.addPackagesTask = addPackagesTask;

const addFilesTask = ({
  files,
  force = false,
  title = 'Adding config'
}) => {
  return {
    title: `${title}...`,
    task: () => {
      let fileNameToContentMap = {};
      files.forEach(fileData => {
        fileNameToContentMap[fileData.path] = fileData.content;
      });
      return (0, _lib.writeFilesTask)(fileNameToContentMap, {
        overwriteExisting: force
      });
    }
  };
};

exports.addFilesTask = addFilesTask;

const addToGitIgnoreTask = ({
  paths
}) => {
  return {
    title: 'Updating .gitignore...',
    skip: () => {
      if (!_fs.default.existsSync(_path.default.resolve((0, _lib.getPaths)().base, '.gitignore'))) {
        return 'No gitignore present, skipping.';
      }
    },
    task: async (_ctx, task) => {
      const gitIgnore = _path.default.resolve((0, _lib.getPaths)().base, '.gitignore');

      const content = _fs.default.readFileSync(gitIgnore).toString();

      if (paths.every(item => content.includes(item))) {
        task.skip('.gitignore already includes the additions.');
      }

      _fs.default.appendFileSync(gitIgnore, ['\n', '# Deployment', ...paths].join('\n'));
    }
  };
};

exports.addToGitIgnoreTask = addToGitIgnoreTask;

const addToDotEnvTask = ({
  lines
}) => {
  return {
    title: 'Updating .env...',
    skip: () => {
      if (!_fs.default.existsSync(_path.default.resolve((0, _lib.getPaths)().base, '.env'))) {
        return 'No .env present, skipping.';
      }
    },
    task: async (_ctx, task) => {
      const env = _path.default.resolve((0, _lib.getPaths)().base, '.env');

      const content = _fs.default.readFileSync(env).toString();

      if (lines.every(line => content.includes(line.split('=')[0]))) {
        task.skip('.env already includes the additions.');
      }

      _fs.default.appendFileSync(env, lines.join('\n'));
    }
  };
};

exports.addToDotEnvTask = addToDotEnvTask;

const printSetupNotes = notes => {
  return {
    title: 'One more thing...',
    task: (_ctx, task) => {
      task.title = `One more thing...\n\n ${(0, _boxen.default)(notes.join('\n'), {
        padding: {
          top: 1,
          bottom: 1,
          right: 1,
          left: 1
        },
        margin: 1,
        borderColour: 'gray'
      })}  \n`;
    }
  };
};

exports.printSetupNotes = printSetupNotes;