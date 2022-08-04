#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = exports.generate = void 0;

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

var _paths = require("../paths");

var _graphqlSchema = require("./graphqlSchema");

var _typeDefinitions = require("./typeDefinitions");

const generate = async () => {
  const schemaPath = await (0, _graphqlSchema.generateGraphQLSchema)();
  const typeDefsPaths = await (0, _typeDefinitions.generateTypeDefs)();
  return [schemaPath, ...typeDefsPaths].filter(x => typeof x === 'string');
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