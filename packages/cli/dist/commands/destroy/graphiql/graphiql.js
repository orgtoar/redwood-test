"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _listr = _interopRequireDefault(require("listr"));

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _graphiql = require("../../setup/graphiql/graphiql");

const removeGraphiqlFromGraphqlHandler = () => {
  const graphqlPath = (0, _lib.getGraphqlPath)();
  let content = (0, _lib.readFile)(graphqlPath).toString();
  const [_, hasHeaderImport] = content.match(/(import .* from 'src\/lib\/generateGraphiQLHeader.*')/s) || [];

  if (hasHeaderImport) {
    // remove header import statement
    content = content.replace(`\n\nimport generateGraphiQLHeader from 'src/lib/generateGraphiQLHeader'`, ''); // remove object from handler

    content = content.replace(`generateGraphiQLHeader,\n`, '');
  }

  (0, _lib.writeFile)(graphqlPath, content, {
    overwriteExisting: true
  });
};

const command = 'graphiql';
exports.command = command;
const description = 'Destroy graphiql header';
exports.description = description;

const handler = () => {
  const path = (0, _graphiql.getOutputPath)();
  const tasks = new _listr.default([{
    title: 'Destroying graphiql files...',
    skip: () => !(0, _lib.existsAnyExtensionSync)(path) && `File doesn't exist`,
    task: () => (0, _lib.deleteFile)(path)
  }, {
    title: 'Removing graphiql import from createGraphQLHandler',
    task: removeGraphiqlFromGraphqlHandler
  }], {
    collapse: false,
    exitOnError: true
  });

  try {
    tasks.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
  }
};

exports.handler = handler;