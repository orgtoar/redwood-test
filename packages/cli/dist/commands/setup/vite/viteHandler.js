"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
require("core-js/modules/esnext.json.parse.js");
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _project = require("../../../lib/project");
const {
  version
} = JSON.parse(_fsExtra.default.readFileSync(_path.default.resolve(__dirname, '../../../../package.json'), 'utf-8'));
const handler = async ({
  force,
  verbose,
  addPackage
}) => {
  const ts = (0, _project.isTypeScriptProject)();
  const tasks = new _listr.Listr([{
    title: 'Adding vite.config.js...',
    task: () => {
      // @NOTE: do not use getPaths().viteConfig because it'll come through as null
      // this is because we do a check for the file's existence in getPaths()
      const viteConfigPath = `${(0, _lib.getPaths)().web.base}/vite.config.${ts ? 'ts' : 'js'}`;
      const templateContent = _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'vite.config.ts.template'), 'utf-8');
      const viteConfigContent = ts ? templateContent : (0, _lib.transformTSToJS)(viteConfigPath, templateContent);
      return (0, _lib.writeFile)(viteConfigPath, viteConfigContent, {
        overwriteExisting: force
      });
    }
  }, {
    title: "Checking bundler isn't set to webpack...",
    task: (_ctx, task) => {
      const redwoodTomlPath = (0, _projectConfig.getConfigPath)();
      const configContent = _fsExtra.default.readFileSync(redwoodTomlPath, 'utf-8');
      if ((0, _includes.default)(configContent).call(configContent, 'bundler = "webpack"')) {
        throw new Error('You have the bundler set to webpack in your redwood.toml. Remove this line, or change it to "vite" and try again.');
      } else {
        task.skip('Vite already configured as the bundler');
      }
    }
  }, {
    title: 'Creating new entry point in `web/src/entry.client.{jsx,tsx}`...',
    task: () => {
      const entryPointFile = _path.default.join((0, _lib.getPaths)().web.src, `entry.client.${ts ? 'tsx' : 'jsx'}`);
      const content = _fsExtra.default.readFileSync(_path.default.join((0, _lib.getPaths)().base,
      // NOTE we're copying over the index.js before babel transform
      'node_modules/@redwoodjs/web/src/entry/index.js'), 'utf-8').replace('~redwood-app-root', './App');
      return (0, _lib.writeFile)(entryPointFile, content, {
        overwriteExisting: force
      });
    }
  }, {
    // @NOTE: make sure its added as a dev package.
    ...(0, _cliHelpers.addWebPackages)(['-D', `@redwoodjs/vite@${version}`]),
    title: 'Adding @redwoodjs/vite dev dependency to web side...',
    skip: () => {
      if (!addPackage) {
        return 'Skipping package install, you will need to add @redwoodjs/vite manaually as a dev-dependency on the web workspace';
      }
    }
  }], {
    rendererOptions: {
      collapseSubtasks: false
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