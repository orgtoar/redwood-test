"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
const SIDE_MAP = {
  web: ['cell', 'component', 'layout', 'page', 'scaffold'],
  api: ['function', 'sdl', 'service']
};
const copyGenerator = (name, {
  force
}) => {
  var _context;
  const side = (0, _includes.default)(_context = SIDE_MAP['web']).call(_context, name) ? 'web' : 'api';
  const from = _path.default.join(__dirname, '../../generate', name, 'templates');
  const to = _path.default.join((0, _lib.getPaths)()[side].generators, name);

  // copy entire template directory contents to appropriate side in app
  _fsExtra.default.copySync(from, to, {
    overwrite: force,
    errorOnExist: true
  });
  return to;
};
let destination;
const tasks = ({
  name,
  force
}) => {
  return new _listr.Listr([{
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
    rendererOptions: {
      collapseSubtasks: false
    },
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