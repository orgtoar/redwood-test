"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.createYargsForComponentDestroy = void 0;

var _listr = _interopRequireDefault(require("listr"));

var _lib = require("../../lib");

var _colors = _interopRequireDefault(require("../../lib/colors"));

const tasks = ({
  componentName,
  filesFn,
  name
}) => new _listr.default([{
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
  collapse: false,
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
      try {
        options = await preTasksFn({ ...options,
          isDestroyer: true
        });
        await tasks({
          componentName,
          filesFn,
          name: options.name
        }).run();
      } catch (e) {
        console.log(_colors.default.error(e.message));
      }
    },
    tasks
  };
};

exports.createYargsForComponentDestroy = createYargsForComponentDestroy;