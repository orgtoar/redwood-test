"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _tasuku = _interopRequireDefault(require("tasuku"));

var _updateJestConfig = _interopRequireDefault(require("./updateJestConfig"));

const command = 'update-jest-config';
exports.command = command;
const description = '(v0.43->v0.44) Updates jest config to be compatible with third-party tooling';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Updating Jest Configs', async ({
    setError
  }) => {
    try {
      await (0, _updateJestConfig.default)();
    } catch (e) {
      setError(`Failed to codemod your project \n ${e === null || e === void 0 ? void 0 : e.message}`);
    }
  });
};

exports.handler = handler;