"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.tasks = exports.handler = exports.description = exports.command = exports.builder = void 0;
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _schemaHelpers = require("../../../lib/schemaHelpers");
var _sdl = require("../../generate/sdl/sdl");
const command = exports.command = 'sdl <model>';
const description = exports.description = 'Destroy a GraphQL schema and service component based on a given DB schema Model';
const builder = yargs => {
  yargs.positional('model', {
    description: 'Model to destroy the sdl of',
    type: 'string'
  });
};
exports.builder = builder;
const tasks = ({
  model
}) => new _listr.Listr([{
  title: 'Destroying GraphQL schema and service component files...',
  task: async () => {
    const f = await (0, _sdl.files)({
      name: model
    });
    return (0, _lib.deleteFilesTask)(f);
  }
}], {
  rendererOptions: {
    collapseSubtasks: false
  },
  exitOnError: true
});
exports.tasks = tasks;
const handler = async ({
  model
}) => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'destroy sdl'
  });
  try {
    const {
      name
    } = await (0, _schemaHelpers.verifyModelName)({
      name: model,
      isDestroyer: true
    });
    await tasks({
      model: name
    }).run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
  }
};
exports.handler = handler;