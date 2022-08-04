#!/usr/bin/env node
"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.run = exports.generate = void 0;

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _paths = require("../paths");

var _graphqlSchema = require("./graphqlSchema");

var _typeDefinitions = require("./typeDefinitions");

const generate = async () => {
  var _context;

  const schemaPath = await (0, _graphqlSchema.generateGraphQLSchema)();
  const typeDefsPaths = await (0, _typeDefinitions.generateTypeDefs)();
  return (0, _filter.default)(_context = [schemaPath, ...typeDefsPaths]).call(_context, x => typeof x === 'string');
};

exports.generate = generate;

const run = async () => {
  console.log();
  console.log('Generating...');
  console.log();
  const rwjsPaths = (0, _paths.getPaths)();
  const files = await generate();

  for (const f of files) {
    console.log('-', f.replace(rwjsPaths.base + '/', ''));
  }

  console.log();
  console.log('... and done.');
};

exports.run = run;

if (require.main === module) {
  run();
}