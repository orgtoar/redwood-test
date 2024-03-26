"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.builder = builder;
exports.description = exports.command = void 0;
exports.handler = handler;
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../../../../lib");
var _colors = _interopRequireDefault(require("../../../../lib/colors"));
var _configureStorybook = _interopRequireDefault(require("../../../../lib/configureStorybook.js"));
var _extendFile = require("../../../../lib/extendFile");
const command = exports.command = 'chakra-ui';
const description = exports.description = 'Set up Chakra UI';
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
}
const CHAKRA_THEME_AND_COMMENTS = `\
// This object will be used to override Chakra-UI theme defaults.
// See https://chakra-ui.com/docs/styled-system/theming/theme for theming options
const theme = {}
export default theme
`;
async function handler({
  force,
  install
}) {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'setup ui chakra-ui',
    force,
    install
  });
  const rwPaths = (0, _lib.getPaths)();
  const packages = ['@chakra-ui/react@^2', '@emotion/react@^11', '@emotion/styled@^11', 'framer-motion@^9'];
  const tasks = new _listr.Listr([{
    title: 'Installing packages...',
    skip: () => !install,
    task: () => {
      return new _listr.Listr([{
        title: `Install ${packages.join(', ')}`,
        task: async () => {
          await (0, _execa.default)('yarn', ['workspace', 'web', 'add', ...packages]);
        }
      }], {
        rendererOptions: {
          collapseSubtasks: false
        }
      });
    }
  }, {
    title: 'Setting up Chakra UI...',
    skip: () => (0, _extendFile.fileIncludes)(rwPaths.web.app, 'ChakraProvider'),
    task: () => (0, _extendFile.extendJSXFile)(rwPaths.web.app, {
      insertComponent: {
        name: 'ChakraProvider',
        props: {
          theme: 'extendedTheme'
        },
        within: 'RedwoodProvider',
        insertBefore: '<ColorModeScript />'
      },
      imports: ["import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'", "import * as theme from 'config/chakra.config'"],
      moduleScopeLines: ['const extendedTheme = extendTheme(theme)']
    })
  }, {
    title: `Creating Theme File...`,
    task: () => {
      (0, _lib.writeFile)(_path.default.join(rwPaths.web.config, 'chakra.config.js'), CHAKRA_THEME_AND_COMMENTS, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Configure Storybook...',
    // skip this task if the user's storybook config already includes "withChakra"
    skip: () => (0, _extendFile.fileIncludes)(rwPaths.web.storybookConfig, 'withChakra'),
    task: async () => (0, _configureStorybook.default)(_path.default.join(__dirname, '..', 'templates', 'chakra.storybook.preview.tsx.template'))
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