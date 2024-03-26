"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.tasks = exports.handler = exports.description = exports.command = exports.builder = void 0;
var _camelcase = _interopRequireDefault(require("camelcase"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _helpers = require("../../generate/helpers");
var _page = require("../../generate/page/page");
const command = exports.command = 'page <name> [path]';
const description = exports.description = 'Destroy a page and route component';
const builder = yargs => {
  yargs.positional('name', {
    description: 'Name of the page',
    type: 'string'
  });
  yargs.positional('path', {
    description: 'URL path to the page. Defaults to name',
    type: 'string'
  });
};
exports.builder = builder;
const tasks = ({
  name,
  path
}) => new _listr.Listr([{
  title: 'Destroying page files...',
  task: async () => {
    const p = (0, _helpers.pathName)(path, name);
    const f = (0, _page.files)({
      name,
      path: p,
      stories: true,
      tests: true,
      ...(0, _page.paramVariants)(p)
    });
    return (0, _lib.deleteFilesTask)(f);
  }
}, {
  title: 'Cleaning up routes file...',
  task: async () => (0, _lib.removeRoutesFromRouterTask)([(0, _camelcase.default)(name)])
}], {
  rendererOptions: {
    collapseSubtasks: false
  },
  exitOnError: true
});
exports.tasks = tasks;
const handler = async ({
  name,
  path
}) => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'destroy page'
  });
  const t = tasks({
    name,
    path
  });
  try {
    await t.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
  }
};
exports.handler = handler;