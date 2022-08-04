"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _lib = require("../../../lib");

var _generate = require("../../generate");

var _helpers = require("../helpers");

const COMPONENT_SUFFIX = 'Layout';
const REDWOOD_WEB_PATH_NAME = 'layouts';

const files = ({
  name,
  typescript = false,
  ...options
}) => {
  const layoutName = (0, _helpers.removeGeneratorName)(name, 'layout');
  const extension = typescript ? '.tsx' : '.js';
  const layoutFile = (0, _helpers.templateForComponentFile)({
    name: layoutName,
    suffix: COMPONENT_SUFFIX,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    extension,
    generator: 'layout',
    templatePath: options.skipLink ? 'layout.tsx.a11yTemplate' : 'layout.tsx.template'
  });
  const testFile = (0, _helpers.templateForComponentFile)({
    name: layoutName,
    suffix: COMPONENT_SUFFIX,
    extension: `.test${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'layout',
    templatePath: 'test.tsx.template'
  });
  const storyFile = (0, _helpers.templateForComponentFile)({
    name: layoutName,
    suffix: COMPONENT_SUFFIX,
    extension: `.stories${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'layout',
    templatePath: 'stories.tsx.template'
  });
  const files = [layoutFile];

  if (options.stories) {
    files.push(storyFile);
  }

  if (options.tests) {
    files.push(testFile);
  } // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }


  return (0, _reduce.default)(files).call(files, (acc, [outputPath, content]) => {
    const template = typescript ? content : (0, _lib.transformTSToJS)(outputPath, content);
    return {
      [outputPath]: template,
      ...acc
    };
  }, {});
};

exports.files = files;
const optionsObj = {
  skipLink: {
    default: false,
    description: 'Generate with skip link',
    type: 'boolean'
  },
  ..._generate.yargsDefaults
};
const {
  command,
  description,
  builder,
  handler
} = (0, _helpers.createYargsForComponentGeneration)({
  componentName: 'layout',
  filesFn: files,
  optionsObj
});
exports.handler = handler;
exports.builder = builder;
exports.description = description;
exports.command = command;