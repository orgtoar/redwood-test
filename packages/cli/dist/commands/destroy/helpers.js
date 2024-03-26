"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.createYargsForComponentDestroy = void 0;
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../../lib");
const tasks = ({
  componentName,
  filesFn,
  name
}) => new _listr.Listr([{
  title: `Destroying ${componentName} files...`,
  task: async () => {
    const f = await filesFn({
      name,
      stories: true,
      tests: true
    });
    return (0, _lib.deleteFilesTask)(f);
  }
}], {
  rendererOptions: {
    collapseSubtasks: false
  },
  exitOnError: true
});
const createYargsForComponentDestroy = ({
  componentName,
  preTasksFn = options => options,
  filesFn
}) => {
  return {
    command: `${componentName} <name>`,
    description: `Destroy a ${componentName} component`,
    builder: yargs => {
      yargs.positional('name', {
        description: `Name of the ${componentName}`,
        type: 'string'
      });
    },
    handler: async options => {
      (0, _cliHelpers.recordTelemetryAttributes)({
        command: `destroy ${componentName}`
      });
      options = await preTasksFn({
        ...options,
        isDestroyer: true
      });
      await tasks({
        componentName,
        filesFn,
        name: options.name
      }).run();
    },
    tasks
  };
};
exports.createYargsForComponentDestroy = createYargsForComponentDestroy;