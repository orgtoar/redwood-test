"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.getVersionOfRedwoodPackageToInstall = getVersionOfRedwoodPackageToInstall;
exports.handler = handler;
require("core-js/modules/esnext.json.parse.js");
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _every = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/every"));
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
var _telemetry = require("@redwoodjs/telemetry");
var _colors = _interopRequireDefault(require("../../lib/colors"));
async function handler({
  force
}) {
  const TEMPLATE_DIR = _path.default.join(__dirname, 'templates', 'docker');
  let dockerfileTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(TEMPLATE_DIR, 'Dockerfile'), 'utf-8');
  const dockerComposeDevTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(TEMPLATE_DIR, 'docker-compose.dev.yml'), 'utf-8');
  const dockerComposeProdTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(TEMPLATE_DIR, 'docker-compose.prod.yml'), 'utf-8');
  const dockerignoreTemplateContent = _fsExtra.default.readFileSync(_path.default.resolve(TEMPLATE_DIR, 'dockerignore'), 'utf-8');
  const dockerfilePath = _path.default.join((0, _projectConfig.getPaths)().base, 'Dockerfile');
  const dockerComposeDevFilePath = _path.default.join((0, _projectConfig.getPaths)().base, 'docker-compose.dev.yml');
  const dockerComposeProdFilePath = _path.default.join((0, _projectConfig.getPaths)().base, 'docker-compose.prod.yml');
  const dockerignoreFilePath = _path.default.join((0, _projectConfig.getPaths)().base, '.dockerignore');
  const tasks = new _listr.Listr([{
    title: 'Confirmation',
    task: async (_ctx, task) => {
      const confirmation = await task.prompt({
        type: 'Confirm',
        message: 'The Dockerfile is experimental. Continue?'
      });
      if (!confirmation) {
        throw new Error('User aborted');
      }
    },
    skip: force
  }, {
    title: 'Adding the official yarn workspace-tools plugin...',
    task: async (_ctx, task) => {
      var _context, _context2;
      const {
        stdout
      } = await _execa.default.command('yarn plugin runtime --json', {
        cwd: (0, _projectConfig.getPaths)().base
      });
      const hasWorkspaceToolsPlugin = (0, _some.default)(_context = (0, _map.default)(_context2 = (0, _trim.default)(stdout).call(stdout).split('\n')).call(_context2, JSON.parse)).call(_context, ({
        name
      }) => name === '@yarnpkg/plugin-workspace-tools');
      if (hasWorkspaceToolsPlugin) {
        task.skip('The official yarn workspace-tools plugin is already installed');
        return;
      }
      return _execa.default.command('yarn plugin import workspace-tools', {
        cwd: (0, _projectConfig.getPaths)().base
      }).stdout;
    }
  }, {
    title: 'Adding @redwoodjs/api-server and @redwoodjs/web-server...',
    task: async (_ctx, task) => {
      var _context3, _context4;
      const apiServerPackageName = '@redwoodjs/api-server';
      const {
        dependencies: apiDependencies
      } = _fsExtra.default.readJSONSync(_path.default.join((0, _projectConfig.getPaths)().api.base, 'package.json'));
      const hasApiServerPackage = (0, _includes.default)(_context3 = (0, _keys.default)(apiDependencies)).call(_context3, apiServerPackageName);
      const webServerPackageName = '@redwoodjs/web-server';
      const {
        dependencies: webDependencies
      } = _fsExtra.default.readJSONSync(_path.default.join((0, _projectConfig.getPaths)().web.base, 'package.json'));
      const hasWebServerPackage = (0, _includes.default)(_context4 = (0, _keys.default)(webDependencies)).call(_context4, webServerPackageName);
      if (hasApiServerPackage && hasWebServerPackage) {
        task.skip(`${apiServerPackageName} and ${webServerPackageName} are already installed`);
        return;
      }
      if (!hasApiServerPackage) {
        const apiServerPackageVersion = await getVersionOfRedwoodPackageToInstall(apiServerPackageName);
        await _execa.default.command(`yarn workspace api add ${apiServerPackageName}@${apiServerPackageVersion}`, {
          cwd: (0, _projectConfig.getPaths)().base
        });
      }
      if (!hasWebServerPackage) {
        const webServerPackageVersion = await getVersionOfRedwoodPackageToInstall(webServerPackageName);
        await _execa.default.command(`yarn workspace web add ${webServerPackageName}@${webServerPackageVersion}`, {
          cwd: (0, _projectConfig.getPaths)().base
        });
      }
      return _execa.default.command(`yarn dedupe`, {
        cwd: (0, _projectConfig.getPaths)().base
      }).stdout;
    }
  }, {
    title: 'Adding the experimental Dockerfile and compose files...',
    task: (_ctx, task) => {
      var _context5;
      const shouldSkip = (0, _every.default)(_context5 = [dockerfilePath, dockerComposeDevFilePath, dockerComposeProdFilePath, dockerignoreFilePath]).call(_context5, _fsExtra.default.existsSync);
      if (!force && shouldSkip) {
        task.skip('The Dockerfile and compose files already exist');
        return;
      }
      const config = (0, _projectConfig.getConfig)();
      const {
        includeEnvironmentVariables
      } = config.web;
      if (includeEnvironmentVariables.length) {
        const webBuildWithPrerenderStageDelimeter = 'FROM api_build as web_build_with_prerender\n';
        const webBuildStageDelimeter = 'FROM base as web_build\n';
        const [beforeWebBuildWithPrerenderStageDelimeter, afterWebBuildWithPrerenderStageDelimeter] = dockerfileTemplateContent.split(webBuildWithPrerenderStageDelimeter);
        const [beforeWebBuildStageDelimeter, afterWebBuildStageDelimeter] = afterWebBuildWithPrerenderStageDelimeter.split(webBuildStageDelimeter);
        dockerfileTemplateContent = [(0, _trim.default)(beforeWebBuildWithPrerenderStageDelimeter).call(beforeWebBuildWithPrerenderStageDelimeter), webBuildWithPrerenderStageDelimeter, ...(0, _map.default)(includeEnvironmentVariables).call(includeEnvironmentVariables, envVar => `ARG ${envVar}`), '', (0, _trim.default)(beforeWebBuildStageDelimeter).call(beforeWebBuildStageDelimeter), webBuildStageDelimeter, ...(0, _map.default)(includeEnvironmentVariables).call(includeEnvironmentVariables, envVar => `ARG ${envVar}`), afterWebBuildStageDelimeter].join('\n');
      }
      (0, _cliHelpers.writeFile)(dockerfilePath, dockerfileTemplateContent, {
        existingFiles: force ? 'OVERWRITE' : 'SKIP'
      }, task);
      (0, _cliHelpers.writeFile)(dockerComposeDevFilePath, dockerComposeDevTemplateContent, {
        existingFiles: force ? 'OVERWRITE' : 'SKIP'
      }, task);
      (0, _cliHelpers.writeFile)(dockerComposeProdFilePath, dockerComposeProdTemplateContent, {
        existingFiles: force ? 'OVERWRITE' : 'SKIP'
      }, task);
      (0, _cliHelpers.writeFile)(dockerignoreFilePath, dockerignoreTemplateContent, {
        existingFiles: force ? 'OVERWRITE' : 'SKIP'
      }, task);
    }
  }, {
    title: 'Adding postgres to .gitignore...',
    task: (_ctx, task) => {
      const gitignoreFilePath = _path.default.join((0, _projectConfig.getPaths)().base, '.gitignore');
      const gitignoreFileContent = _fsExtra.default.readFileSync(gitignoreFilePath, 'utf-8');
      if ((0, _includes.default)(gitignoreFileContent).call(gitignoreFileContent, 'postgres')) {
        task.skip('postgres is already ignored by git');
        return;
      }
      (0, _cliHelpers.writeFile)(gitignoreFilePath, (0, _concat.default)(gitignoreFileContent).call(gitignoreFileContent, '\npostgres\n'), {
        existingFiles: 'OVERWRITE'
      });
    }
  }, {
    title: 'Adding config to redwood.toml...',
    task: (_ctx, task) => {
      const redwoodTomlPath = (0, _projectConfig.getConfigPath)();
      let configContent = _fsExtra.default.readFileSync(redwoodTomlPath, 'utf-8');
      const browserOpenRegExp = /open\s*=\s*true/;
      const hasOpenSetToTrue = browserOpenRegExp.test(configContent);
      const hasExperimentalDockerfileConfig = (0, _includes.default)(configContent).call(configContent, '[experimental.dockerfile]');
      if (!hasOpenSetToTrue && hasExperimentalDockerfileConfig) {
        task.skip(`The [experimental.dockerfile] config block already exists in your 'redwood.toml' file`);
        return;
      }
      if (hasOpenSetToTrue) {
        configContent = configContent.replace(/open\s*=\s*true/, 'open = false');
      }
      if (!hasExperimentalDockerfileConfig) {
        configContent = (0, _concat.default)(configContent).call(configContent, `\n[experimental.dockerfile]\n\tenabled = true\n`);
      }

      // using string replace here to preserve comments and formatting.
      (0, _cliHelpers.writeFile)(redwoodTomlPath, configContent, {
        existingFiles: 'OVERWRITE'
      });
    }
  }], {
    renderer: process.env.NODE_ENV === 'test' ? 'verbose' : 'default'
  });
  try {
    await tasks.run();
    console.log(['', "We've written four files:", '', '- ./Dockerfile', '- ./.dockerignore', '- ./docker-compose.dev.yml', '- ./docker-compose.prod.yml', '', 'To start the docker compose dev:', '', '  docker compose -f docker-compose.dev.yml up ', '', 'Then, connect to the container and migrate your database:', '', '  docker compose -f ./docker-compose.dev.yml run --rm -it console /bin/bash', '  root@...:/home/node/app# yarn rw prisma migrate dev', '', "Lastly, ensure you have Docker. If you don't, see https://docs.docker.com/desktop/", '', "There's a lot in the Dockerfile and there's a reason for every line.", 'Be sure to check out the docs: https://redwoodjs.com/docs/docker'].join('\n'));
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
}
async function getVersionOfRedwoodPackageToInstall(module) {
  var _context6;
  const packageJsonPath = require.resolve('@redwoodjs/cli/package.json', {
    paths: [(0, _projectConfig.getPaths)().base]
  });
  let {
    version
  } = _fsExtra.default.readJSONSync(packageJsonPath);
  const packumentP = await fetch(`https://registry.npmjs.org/${module}`);
  const packument = await packumentP.json();

  // If the version includes a plus, like '4.0.0-rc.428+dd79f1726'
  // (all @canary, @next, and @rc packages do), get rid of everything after the plus.
  if ((0, _includes.default)(version).call(version, '+')) {
    version = version.split('+')[0];
  }
  const versionIsPublished = (0, _includes.default)(_context6 = (0, _keys.default)(packument.versions)).call(_context6, version);

  // Fallback to canary. This is most likely because it's a new package
  if (!versionIsPublished) {
    version = 'canary';
  }
  return version;
}