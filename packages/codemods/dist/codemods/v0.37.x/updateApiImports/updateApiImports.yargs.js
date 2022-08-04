"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _path = _interopRequireDefault(require("path"));

var _tasuku = _interopRequireDefault(require("tasuku"));

var _getFilesWithPattern = _interopRequireDefault(require("../../../lib/getFilesWithPattern"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

var _runTransform = _interopRequireDefault(require("../../../lib/runTransform"));

const command = 'update-api-imports';
exports.command = command;
const description = '(v0.36->v0.37) Updates @redwoodjs/api imports to @redwoodjs/graphql-server';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Updating @redwoodjs/api imports', async ({
    setWarning
  }) => {
    const rwPaths = (0, _getRWPaths.default)();
    const files = (0, _getFilesWithPattern.default)({
      pattern: `from '@redwoodjs/api'`,
      filesToSearch: [rwPaths.api.src]
    });

    if (files.length === 0) {
      setWarning('No files found');
    } else {
      await (0, _runTransform.default)({
        transformPath: _path.default.join(__dirname, 'updateApiImports.js'),
        targetPaths: files
      });
    }
  });
};

exports.handler = handler;