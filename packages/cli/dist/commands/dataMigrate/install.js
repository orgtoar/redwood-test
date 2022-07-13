"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = void 0;

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _listr = _interopRequireDefault(require("listr"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../lib");

var _colors = _interopRequireDefault(require("../../lib/colors"));

const MODEL = `model RW_DataMigration {
  version    String   @id
  name       String
  startedAt  DateTime
  finishedAt DateTime
}`;
const POST_INSTALL_INSTRUCTIONS = `${_colors.default.warning("Don't forget to apply your migration when ready:")}

    ${_colors.default.bold('yarn rw prisma migrate dev')}
`; // Creates dataMigrations directory

const createPath = () => {
  return _fsExtra.default.outputFileSync(_path.default.join((0, _lib.getPaths)().api.dataMigrations, '.keep'), '');
}; // Appends RW_DataMigration model to schema.prisma


const appendModel = () => {
  const schemaPath = (0, _lib.getPaths)().api.dbSchema;

  const schema = _fsExtra.default.readFileSync(schemaPath).toString();

  const newSchema = `${schema}\n${MODEL}\n`;
  return _fsExtra.default.writeFileSync(schemaPath, newSchema);
}; // Create a new migration


const save = async () => {
  return await (0, _execa.default)('yarn rw', ['prisma migrate dev', '--name create_data_migrations', '--create-only'], {
    cwd: (0, _lib.getPaths)().api.base,
    shell: true
  });
};

const command = 'install';
exports.command = command;
const description = 'Add the RW_DataMigration model to your schema';
exports.description = description;

const builder = yargs => {
  yargs.epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#install')}`);
};

exports.builder = builder;

const handler = async () => {
  const tasks = new _listr.default([{
    title: `Creating dataMigrations directory...`,
    task: createPath
  }, {
    title: 'Adding RW_DataMigration model to schema.prisma...',
    task: await appendModel
  }, {
    title: 'Create db migration...',
    task: await save
  }, {
    title: 'One more thing...',
    task: (_ctx, task) => {
      task.title = `Next steps:\n   ${POST_INSTALL_INSTRUCTIONS}`;
    }
  }], {
    collapse: false,
    exitOnError: true
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