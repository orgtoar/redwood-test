"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.updateApiURLTask = exports.preRequisiteCheckTask = exports.addToGitIgnoreTask = exports.addToDotEnvTask = exports.addFilesTask = void 0;
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _every = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/every"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _lib = require("../../../../lib");
const REDWOOD_TOML_PATH = _path.default.join((0, _lib.getPaths)().base, 'redwood.toml');
const updateApiURLTask = apiUrl => {
  return {
    title: 'Updating API URL in redwood.toml...',
    task: () => {
      const redwoodToml = _fsExtra.default.readFileSync(REDWOOD_TOML_PATH).toString();
      let newRedwoodToml = redwoodToml;
      if (redwoodToml.match(/apiUrl/)) {
        newRedwoodToml = newRedwoodToml.replace(/apiUrl.*/g, `apiUrl = "${apiUrl}"`);
      } else if (redwoodToml.match(/\[web\]/)) {
        newRedwoodToml = newRedwoodToml.replace(/\[web\]/, `[web]\n  apiUrl = "${apiUrl}"`);
      } else {
        newRedwoodToml += `[web]\n  apiUrl = "${apiUrl}"`;
      }
      _fsExtra.default.writeFileSync(REDWOOD_TOML_PATH, newRedwoodToml);
    }
  };
};

/**
 * Use this to create checks prior to running setup commands
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
    task: () => new _listr.Listr((0, _map.default)(preRequisites).call(preRequisites, preReq => {
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
 * Use this to add files to a users project
 *
 * @example
 * addFilesTask(
 *  files: [ { path: path.join(getPaths().base, 'netlify.toml'), content: NETLIFY_TOML }],
 * )
 */
exports.preRequisiteCheckTask = preRequisiteCheckTask;
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
      if (!_fsExtra.default.existsSync(_path.default.resolve((0, _lib.getPaths)().base, '.gitignore'))) {
        return 'No gitignore present, skipping.';
      }
    },
    task: async (_ctx, task) => {
      const gitIgnore = _path.default.resolve((0, _lib.getPaths)().base, '.gitignore');
      const content = _fsExtra.default.readFileSync(gitIgnore).toString();
      if ((0, _every.default)(paths).call(paths, item => (0, _includes.default)(content).call(content, item))) {
        task.skip('.gitignore already includes the additions.');
      }
      _fsExtra.default.appendFileSync(gitIgnore, ['\n', '# Deployment', ...paths].join('\n'));
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
      if (!_fsExtra.default.existsSync(_path.default.resolve((0, _lib.getPaths)().base, '.env'))) {
        return 'No .env present, skipping.';
      }
    },
    task: async (_ctx, task) => {
      const env = _path.default.resolve((0, _lib.getPaths)().base, '.env');
      const content = _fsExtra.default.readFileSync(env).toString();
      if ((0, _every.default)(lines).call(lines, line => (0, _includes.default)(content).call(content, line.split('=')[0]))) {
        task.skip('.env already includes the additions.');
      }
      _fsExtra.default.appendFileSync(env, lines.join('\n'));
    }
  };
};
exports.addToDotEnvTask = addToDotEnvTask;