"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _tasuku = _interopRequireDefault(require("tasuku"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

var _runTransform = _interopRequireDefault(require("../../../lib/runTransform"));

const command = 'update-scenarios';
exports.command = command;
const description = "(v0.36->v0.37) Updates Scenarios (adds Prisma create's data key)";
/**
 * The services dir looks like...
 *
 * services
 * |- users
 *    |- users.js
 *    |- users.scenario.js
 *    |- users.test.js
 * |- posts
 *    |- post.js
 *    |- post.scenario.js
 *    |- post.test.js
 */

exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Updating Scenarios', async () => {
    await (0, _runTransform.default)({
      transformPath: _path.default.join(__dirname, 'updateScenarios.js'),
      targetPaths: _fastGlob.default.sync('api/src/services/**/*.scenarios.{js,ts}', {
        cwd: (0, _getRWPaths.default)().base,
        absolute: true
      })
    });
  });
};

exports.handler = handler;