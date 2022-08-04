"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = void 0;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _listr = _interopRequireDefault(require("listr"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

const command = 'generator <name>';
exports.command = command;
const description = 'Copies generator templates locally for customization';
exports.description = description;
const SIDE_MAP = {
  web: ['cell', 'component', 'layout', 'page', 'scaffold'],
  api: ['function', 'sdl', 'service']
};
const EXCLUDE_GENERATORS = ['dataMigration', 'dbAuth', 'generator', 'script', 'secret'];

const copyGenerator = (name, {
  force
}) => {
  var _context;

  const side = (0, _includes.default)(_context = SIDE_MAP['web']).call(_context, name) ? 'web' : 'api';

  const from = _path.default.join(__dirname, '../../generate', name, 'templates');

  const to = _path.default.join((0, _lib.getPaths)()[side].generators, name); // copy entire template directory contents to appropriate side in app


  _fsExtra.default.copySync(from, to, {
    overwrite: force,
    errorOnExist: true
  });

  return to;
}; // This could be built using createYargsForComponentGeneration;
// however, functions wouldn't have a `stories` option. createYargs...
// should be reversed to provide `yargsDefaults` as the default configuration
// and accept a configuration such as its CURRENT default to append onto a command.


const builder = yargs => {
  var _context2, _context3;

  const availableGenerators = (0, _map.default)(_context2 = (0, _filter.default)(_context3 = _fs.default.readdirSync(_path.default.join(__dirname, '../../generate'), {
    withFileTypes: true
  })).call(_context3, dir => dir.isDirectory() && !dir.name.match(/__/))).call(_context2, dir => dir.name);
  yargs.positional('name', {
    description: 'Name of the generator to copy templates from',
    choices: (0, _filter.default)(availableGenerators).call(availableGenerators, dir => !(0, _includes.default)(EXCLUDE_GENERATORS).call(EXCLUDE_GENERATORS, dir))
  }).option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing files',
    type: 'boolean'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup-generator')}`);
};

exports.builder = builder;
let destination;

const tasks = ({
  name,
  force
}) => {
  return new _listr.default([{
    title: 'Copying generator templates...',
    task: () => {
      destination = copyGenerator(name, {
        force
      });
    }
  }, {
    title: 'Destination:',
    task: (ctx, task) => {
      task.title = `  Wrote templates to ${destination.replace((0, _lib.getPaths)().base, '')}`;
    }
  }], {
    collapse: false,
    errorOnExist: true
  });
};

const handler = async ({
  name,
  force
}) => {
  const t = tasks({
    name,
    force
  });

  try {
    await t.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
  }
};

exports.handler = handler;