"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = void 0;

var _path = _interopRequireDefault(require("path"));

var _tasuku = _interopRequireDefault(require("tasuku"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

var _runTransform = _interopRequireDefault(require("../../../lib/runTransform"));

const command = 'configure-fastify';
exports.command = command;
const description = '(v2.x.x->v2.x.x) Converts world to bazinga';
exports.description = description;

const handler = () => {
  (0, _tasuku.default)('Configure Fastify', async ({
    setOutput
  }) => {
    await (0, _runTransform.default)({
      transformPath: _path.default.join(__dirname, 'configureFastify.js'),
      // Here we know exactly which file we need to transform, but often times you won't.
      // If you need to transform files based on their name, location, etc, use `fast-glob`.
      // If you need to transform files based on their contents, use `getFilesWithPattern`.
      targetPaths: [_path.default.join((0, _getRWPaths.default)().base, 'redwood.toml')]
    });
    setOutput('All done! Run `yarn rw lint --fix` to prettify your code');
  });
};

exports.handler = handler;