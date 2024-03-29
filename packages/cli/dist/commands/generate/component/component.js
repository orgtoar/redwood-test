"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));
require("core-js/modules/es.array.push.js");
var _lib = require("../../../lib");
var _helpers = require("../helpers");
const REDWOOD_WEB_PATH_NAME = 'components';
const files = async ({
  name,
  typescript = false,
  ...options
}) => {
  const extension = typescript ? '.tsx' : '.jsx';
  const componentFile = await (0, _helpers.templateForComponentFile)({
    name,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    extension,
    generator: 'component',
    templatePath: 'component.tsx.template'
  });
  const testFile = await (0, _helpers.templateForComponentFile)({
    name,
    extension: `.test${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'component',
    templatePath: 'test.tsx.template'
  });
  const storiesFile = await (0, _helpers.templateForComponentFile)({
    name,
    extension: `.stories${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'component',
    // Using two different template files here because we have a TS-specific
    // information in a comment in the .tsx template
    templatePath: typescript ? 'stories.tsx.template' : 'stories.jsx.template'
  });
  const files = [componentFile];
  if (options.stories) {
    files.push(storiesFile);
  }
  if (options.tests) {
    files.push(testFile);
  }

  // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }
  return (0, _reduce.default)(files).call(files, async (accP, [outputPath, content]) => {
    const acc = await accP;
    const template = typescript ? content : await (0, _lib.transformTSToJS)(outputPath, content);
    return {
      [outputPath]: template,
      ...acc
    };
  }, _promise.default.resolve({}));
};
exports.files = files;
const description = exports.description = 'Generate a component';
const {
  command,
  builder,
  handler
} = (0, _helpers.createYargsForComponentGeneration)({
  componentName: 'component',
  filesFn: files
});
exports.handler = handler;
exports.builder = builder;
exports.command = command;