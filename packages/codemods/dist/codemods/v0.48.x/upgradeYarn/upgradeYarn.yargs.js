"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _tasuku = _interopRequireDefault(require("tasuku"));

var _upgradeYarn = _interopRequireDefault(require("./upgradeYarn"));

const command = 'upgrade-yarn';
exports.command = command;
const description = '(v0.48.x->v0.48.x) Changes the structure of your Redwood Project';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Upgrade Yarn', async ({
    setError
  }) => {
    try {
      await (0, _upgradeYarn.default)();
    } catch (e) {
      setError('Failed to codemod your project \n' + (e === null || e === void 0 ? void 0 : e.message));
    }
  });
};

exports.handler = handler;