"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = void 0;

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _tasuku = _interopRequireDefault(require("tasuku"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

var _runTransform = _interopRequireDefault(require("../../../lib/runTransform"));

const command = 'update-cell-mocks';
exports.command = command;
const description = '(v0.38->v0.39) Updates standard cell mocks to export functions, instead of objects';
exports.description = description;

const handler = () => {
  const rwPaths = (0, _getRWPaths.default)();

  const cellMocks = _fastGlob.default.sync('**/*.mock.{js,ts}', {
    cwd: rwPaths.web.src,
    absolute: true
  });

  (0, _tasuku.default)('Updating Cell mocks', async ({
    setWarning,
    setOutput
  }) => {
    if (cellMocks.length < 1) {
      setWarning('No cell mocks found');
    } else {
      await (0, _runTransform.default)({
        transformPath: _path.default.join(__dirname, 'updateCellMocks.js'),
        targetPaths: cellMocks
      });
    }

    setOutput('All done! Run `yarn rw lint --fix` to prettify your code');
  });
};

exports.handler = handler;