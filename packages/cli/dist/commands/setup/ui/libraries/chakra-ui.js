"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.builder = builder;
exports.description = exports.command = void 0;
exports.handler = handler;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

var _configureStorybook = _interopRequireDefault(require("../../../../lib/configureStorybook.js"));

var _setupChakra = require("../tasks/setup-chakra");

const command = 'chakra-ui';
exports.command = command;
const description = 'Set up Chakra UI';
exports.description = description;

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

async function handler({
  force,
  install
}) {
  const packages = ['@chakra-ui/react@^1', '@emotion/react@^11', '@emotion/styled@^11', 'framer-motion@^6'];
  const tasks = new _listr.default([{
    title: 'Installing packages...',
    skip: () => !install,
    task: () => {
      return new _listr.default([{
        title: `Install ${packages.join(', ')}`,
        task: async () => {
          await (0, _execa.default)('yarn', ['workspace', 'web', 'add', ...packages]);
        }
      }]);
    }
  }, {
    title: 'Setting up Chakra UI...',
    skip: () => (0, _setupChakra.checkSetupStatus)() === 'done',
    task: () => (0, _setupChakra.wrapWithChakraProvider)()
  }, {
    title: 'Configure Storybook...',
    task: async () => (0, _configureStorybook.default)({
      force
    }, _fs.default.readFileSync(_path.default.join(__dirname, '..', 'templates', 'storybook.preview.js.template'), 'utf-8'))
  }]);

  try {
    await tasks.run();
  } catch (e) {
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
}