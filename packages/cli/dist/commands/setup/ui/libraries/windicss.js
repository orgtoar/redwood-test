"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = exports.aliases = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../../lib");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

const command = 'windicss';
exports.command = command;
const aliases = ['windi'];
exports.aliases = aliases;
const description = 'Set up WindiCSS';
exports.description = description;

const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  });
  yargs.option('install', {
    alias: 'i',
    default: true,
    description: 'Install packages',
    type: 'boolean'
  });
};

exports.builder = builder;

const windiImportsExist = appFile => appFile.match(/^import 'windi\.css'$/m);

const handler = async ({
  force,
  install
}) => {
  const rwPaths = (0, _lib.getPaths)();
  const packages = ['windicss-webpack-plugin', 'windicss'];
  const tasks = new _listr.default([{
    title: 'Installing packages...',
    skip: () => !install,
    task: () => {
      return new _listr.default([{
        title: `Install ${packages.join(', ')}`,
        task: async () => {
          await (0, _execa.default)('yarn', ['workspace', 'web', 'add', '-D', ...packages]);
        }
      }]);
    }
  }, {
    title: 'Setup Webpack...',
    task: () => {
      return new _listr.default([{
        title: 'Setup Webpack',
        task: async () => {
          await (0, _execa.default)('yarn', ['redwood', 'setup', 'webpack']);
        }
      }, {
        title: 'Configure WindiCSS',
        task: async () => {
          const webpackConfig = _fs.default.readFileSync(rwPaths.web.webpack, 'utf-8');

          const newWebpackConfig = `const WindiCSSWebpackPlugin = require('windicss-webpack-plugin')\n\n` + webpackConfig.replace('// config.plugins.push(YOUR_PLUGIN)', '// config.plugins.push(YOUR_PLUGIN)\n  config.plugins.push(new WindiCSSWebpackPlugin())');

          _fs.default.writeFileSync(rwPaths.web.webpack, newWebpackConfig);
        }
      }]);
    }
  }, {
    title: 'Initializing WindiCSS...',
    task: async () => {
      const windiConfigPath = _path.default.join(rwPaths.web.config, 'windi.config.js');

      if (_fs.default.existsSync(windiConfigPath)) {
        if (force) {
          _fs.default.unlinkSync(windiConfigPath);
        } else {
          throw new Error('Windicss config already exists.\nUse --force to override existing config.');
        }
      }

      const windiConfig = ["import { defineConfig } from 'windicss/helpers'", '', 'export default defineConfig({', '  extract: {', "    include: ['**/*.{js,jsx,tsx,css}'],", "    exclude: ['node_modules', '.git', 'dist'],", '  },', '})'].join('\n');

      _fs.default.writeFileSync(windiConfigPath, windiConfig);
    }
  }, {
    title: `Adding import to ${rwPaths.web.app}...`,
    task: (_ctx, task) => {
      const APP_FILE_PATH = rwPaths.web.app;

      const appFile = _fs.default.readFileSync(APP_FILE_PATH, 'utf-8');

      if (windiImportsExist(appFile)) {
        task.skip('Imports already exist in ' + APP_FILE_PATH);
      } else {
        const newAppFile = appFile.replace("import Routes from 'src/Routes'", "import Routes from 'src/Routes'\n\nimport 'windi.css'");

        _fs.default.writeFileSync(APP_FILE_PATH, newAppFile);
      }
    }
  }]);

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
};

exports.handler = handler;