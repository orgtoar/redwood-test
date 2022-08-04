"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

var _lib = require("../../../lib");

var _helpers = require("../helpers");

const REDWOOD_WEB_PATH_NAME = 'components';

const files = ({
  name,
  typescript = false,
  ...options
}) => {
  const extension = typescript ? '.tsx' : '.js';
  const componentFile = (0, _helpers.templateForComponentFile)({
    name,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    extension,
    generator: 'component',
    templatePath: 'component.tsx.template'
  });
  const testFile = (0, _helpers.templateForComponentFile)({
    name,
    extension: `.test${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'component',
    templatePath: 'test.tsx.template'
  });
  const storiesFile = (0, _helpers.templateForComponentFile)({
    name,
    extension: `.stories${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'component',
    templatePath: 'stories.tsx.template'
  });
  const files = [componentFile];

  if (options.stories) {
    files.push(storiesFile);
  }

  if (options.tests) {
    files.push(testFile);
  } // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }


  return files.reduce((acc, [outputPath, content]) => {
    const template = typescript ? content : (0, _lib.transformTSToJS)(outputPath, content);
    return {
      [outputPath]: template,
      ...acc
    };
  }, {});
};

exports.files = files;
const description = 'Generate a component';
exports.description = description;
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