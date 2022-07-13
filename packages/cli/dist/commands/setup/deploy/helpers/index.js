"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.updateApiURLTask = exports.printSetupNotes = exports.preRequisiteCheckTask = exports.addToGitIgnoreTask = exports.addToDotEnvTask = exports.addPackagesTask = exports.addFilesTask = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _every = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/every"));

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
    task: () => new _listr.default((0, _map.default)(preRequisites).call(preRequisites, preReq => {
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
  const packagesWithSameRWVersion = (0, _map.default)(packages).call(packages, pkg => {
    if ((0, _includes.default)(pkg).call(pkg, '@redwoodjs')) {
      return `${pkg}@${(0, _lib.getInstalledRedwoodVersion)()}`;
    } else {
      return pkg;
    }
  });
  let installCommand; // if web,api

  if (side !== 'project') {
    var _context;

    installCommand = ['yarn', (0, _filter.default)(_context = ['workspace', side, 'add', devDependency && '--dev', ...packagesWithSameRWVersion]).call(_context, Boolean)];
  } else {
    var _context2, _context3;

    const stdout = (0, _child_process.execSync)('yarn --version');
    const yarnVersion = (0, _trim.default)(_context2 = stdout.toString()).call(_context2);
    installCommand = ['yarn', (0, _filter.default)(_context3 = [(0, _startsWith.default)(yarnVersion).call(yarnVersion, '1') && '-W', 'add', devDependency && '--dev', ...packagesWithSameRWVersion]).call(_context3, Boolean)];
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
      (0, _forEach.default)(files).call(files, fileData => {
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

      if ((0, _every.default)(paths).call(paths, item => (0, _includes.default)(content).call(content, item))) {
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

      if ((0, _every.default)(lines).call(lines, line => (0, _includes.default)(content).call(content, line.split('=')[0]))) {
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