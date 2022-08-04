"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchTransformSnapshot = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _tempy = _interopRequireDefault(require("tempy"));

var _runTransform = _interopRequireDefault(require("../lib/runTransform"));

var _index = require("./index");

const matchTransformSnapshot = async (transformName, fixtureName = transformName, parser = 'tsx') => {
  const tempFilePath = _tempy.default.file(); // Looks up the path of the caller


  const testPath = expect.getState().testPath;

  if (!testPath) {
    throw new Error('Could not find test path');
  } // Use require.resolve, so we can pass in ts/js/tsx without specifying


  const fixturePath = require.resolve(_path.default.join(testPath, '../../__testfixtures__', `${fixtureName}.input`));

  const transformPath = require.resolve(_path.default.join(testPath, '../../', transformName)); // Step 1: Copy fixture to temp file


  _fs.default.copyFileSync(fixturePath, tempFilePath, _fs.default.constants.COPYFILE_FICLONE); // Step 2: Run transform against temp file


  await (0, _runTransform.default)({
    transformPath,
    targetPaths: [tempFilePath],
    parser
  }); // Step 3: Read modified file and snapshot

  const transformedContent = _fs.default.readFileSync(tempFilePath, 'utf-8');

  const expectedOutput = _fs.default.readFileSync(fixturePath.replace('.input.', '.output.'), 'utf-8');

  expect((0, _index.formatCode)(transformedContent)).toEqual((0, _index.formatCode)(expectedOutput));
};

exports.matchTransformSnapshot = matchTransformSnapshot;