"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.filter.js");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _paramCase = require("param-case");

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _generate = require("../../generate");

const POST_RUN_INSTRUCTIONS = `Next steps...\n\n   ${_colors.default.warning('After writing your migration, you can run it with:')}

     yarn rw dataMigrate up
`;
const TEMPLATE_PATHS = {
  js: _path.default.resolve(__dirname, 'templates', 'dataMigration.js.template'),
  ts: _path.default.resolve(__dirname, 'templates', 'dataMigration.ts.template')
};

const files = ({
  name,
  typescript
}) => {
  const now = new Date().toISOString();
  const timestamp = now.split('.')[0].replace(/\D/g, '');
  const basename = `${timestamp}-${(0, _paramCase.paramCase)(name)}`;
  const extension = typescript ? 'ts' : 'js';
  const outputFilename = basename + '.' + extension;

  const outputPath = _path.default.join((0, _lib.getPaths)().api.dataMigrations, outputFilename);

  return {
    [outputPath]: _fs.default.readFileSync(TEMPLATE_PATHS[extension]).toString()
  };
};

exports.files = files;
const command = 'dataMigration <name>';
exports.command = command;
const description = 'Generate a data migration';
exports.description = description;

const builder = yargs => {
  yargs.positional('name', {
    description: 'A descriptor of what this data migration does',
    type: 'string'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-datamigration')}`); // Merge generator defaults in

  Object.entries(_generate.yargsDefaults).forEach(([option, config]) => {
    yargs.option(option, config);
  });
};

exports.builder = builder;

const handler = async args => {
  const tasks = new _listr.default([{
    title: 'Generating data migration file...',
    task: () => {
      return (0, _lib.writeFilesTask)(files(args));
    }
  }, {
    title: 'Next steps...',
    task: (_ctx, task) => {
      task.title = POST_RUN_INSTRUCTIONS;
    }
  }].filter(Boolean), {
    collapse: false
  });

  try {
    await tasks.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
    process.exit(1);
  }
};

exports.handler = handler;