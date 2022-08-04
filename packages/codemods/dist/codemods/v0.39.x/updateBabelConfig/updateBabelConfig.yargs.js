"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _tasuku = _interopRequireDefault(require("tasuku"));

var _updateBabelConfig = require("./updateBabelConfig");

const command = 'update-babel-config';
exports.command = command;
const description = '(v0.38-v0.39) Removes babel config from the project';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Update babel config', async ({
    setError
  }) => {
    try {
      await (0, _updateBabelConfig.removeBabelConfig)();
    } catch (e) {
      setError(`Failed to codemod your project \n ${e === null || e === void 0 ? void 0 : e.message}`);
    }
  });
};

exports.handler = handler;