"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.builder = builder;
exports.description = exports.command = void 0;
exports.handler = handler;
var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../../../../lib");
var _colors = _interopRequireDefault(require("../../../../lib/colors"));
var _configureStorybook = _interopRequireDefault(require("../../../../lib/configureStorybook.js"));
var _extendFile = require("../../../../lib/extendFile");
const command = exports.command = 'mantine';
const description = exports.description = 'Set up Mantine UI';
const ALL_KEYWORD = 'all';
const ALL_MANTINE_PACKAGES = ['core', 'dates', 'dropzone', 'form', 'hooks', 'modals', 'notifications', 'prism', 'rte', 'spotlight'];
const MANTINE_THEME_AND_COMMENTS = `\
import { createTheme } from '@mantine/core'

/**
 * This object will be used to override Mantine theme defaults.
 * See https://mantine.dev/theming/mantine-provider/#theme-object for theming options
 * @type {import("@mantine/core").MantineThemeOverride}
 */
const theme = {}

export default createTheme(theme)
`;
function builder(yargs) {
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
  yargs.option('packages', {
    alias: 'p',
    default: ['core', 'hooks'],
    description: `Mantine packages to install. Specify '${ALL_KEYWORD}' to install all packages. Default: ['core', 'hooks']`,
    type: 'array'
  });
}
async function handler({
  force,
  install,
  packages
}) {
  var _context, _context2;
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup ui mantine',
    force,
    install,
    packages
  });
  const rwPaths = (0, _lib.getPaths)();
  const configFilePath = _path.default.join(rwPaths.web.config, 'mantine.config.js');
  const installPackages = (0, _concat.default)(_context = (0, _map.default)(_context2 = (0, _includes.default)(packages).call(packages, ALL_KEYWORD) ? ALL_MANTINE_PACKAGES : packages).call(_context2, pack => `@mantine/${pack}`)).call(_context, 'postcss', 'postcss-preset-mantine', 'postcss-simple-vars');
  const tasks = new _listr.Listr([{
    title: 'Installing packages...',
    skip: () => !install,
    task: () => {
      return new _listr.Listr([{
        title: `Install ${installPackages.join(', ')}`,
        task: async () => {
          await (0, _execa.default)('yarn', ['workspace', 'web', 'add', '-D', '@emotion/react', ...installPackages]);
        }
      }], {
        rendererOptions: {
          collapseSubtasks: false
        }
      });
    }
  }, {
    title: 'Setting up Mantine...',
    skip: () => (0, _extendFile.fileIncludes)(rwPaths.web.app, 'MantineProvider'),
    task: () => (0, _extendFile.extendJSXFile)(rwPaths.web.app, {
      insertComponent: {
        name: 'MantineProvider',
        props: {
          theme: 'theme'
        },
        within: 'RedwoodProvider'
      },
      imports: ["import { MantineProvider } from '@mantine/core'", "import theme from 'config/mantine.config'", "import '@mantine/core/styles.css'"]
    })
  }, {
    title: 'Configuring PostCSS...',
    task: () => {
      /**
       * Check if PostCSS config already exists.
       * If it exists, throw an error.
       */
      const postCSSConfigPath = rwPaths.web.postcss;
      if (!force && _fsExtra.default.existsSync(postCSSConfigPath)) {
        throw new Error('PostCSS config already exists.\nUse --force to override existing config.');
      } else {
        const postCSSConfig = _fsExtra.default.readFileSync(_path.default.join(__dirname, '../templates/mantine-postcss.config.js.template'), 'utf-8');
        return _fsExtra.default.outputFileSync(postCSSConfigPath, postCSSConfig);
      }
    }
  }, {
    title: `Creating Theme File...`,
    task: () => {
      (0, _lib.writeFile)(configFilePath, MANTINE_THEME_AND_COMMENTS, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Configure Storybook...',
    skip: () => (0, _extendFile.fileIncludes)(rwPaths.web.storybookPreviewConfig, 'withMantine'),
    task: async () => (0, _configureStorybook.default)(_path.default.join(__dirname, '..', 'templates', 'mantine.storybook.preview.tsx.template'))
  }], {
    rendererOptions: {
      collapseSubtasks: false
    }
  });
  try {
    await tasks.run();
  } catch (e) {
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
}