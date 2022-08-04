"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchFolderTransform = void 0;

var _path = _interopRequireDefault(require("path"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _index = require("./index");

const matchFolderTransform = async (transformFunction, fixtureName, {
  removeWhitespace
} = {
  removeWhitespace: false
}) => {
  const tempDir = (0, _index.createProjectMock)(); // Override paths used in getPaths() utility func

  process.env.RWJS_CWD = tempDir; // Looks up the path of the caller

  const testPath = expect.getState().testPath;

  if (!testPath) {
    throw new Error('Could not find test path');
  }

  const fixtureFolder = _path.default.join(testPath, '../../__testfixtures__', fixtureName);

  const fixtureInputDir = _path.default.join(fixtureFolder, 'input');

  const fixtureOutputDir = _path.default.join(fixtureFolder, 'output'); // Step 1: Copy files recursively from fixture folder to temp


  _fsExtra.default.copySync(fixtureInputDir, tempDir, {
    overwrite: true
  }); // Step 2: Run transform against temp dir


  await transformFunction();
  const GLOB_CONFIG = {
    absolute: false,
    dot: true,
    ignore: ['redwood.toml', '**/*.DS_Store'] // ignore the fake redwood.toml added for getRWPaths

  };

  const transformedPaths = _fastGlob.default.sync('**/*', { ...GLOB_CONFIG,
    cwd: tempDir
  });

  const expectedPaths = _fastGlob.default.sync('**/*', { ...GLOB_CONFIG,
    cwd: fixtureOutputDir
  }); // Step 3: Check output paths


  expect(transformedPaths).toEqual(expectedPaths); // Step 4: Check contents of each file

  transformedPaths.forEach(transformedFile => {
    const actualPath = _path.default.join(tempDir, transformedFile);

    const expectedPath = _path.default.join(fixtureOutputDir, transformedFile);

    expect(actualPath).toMatchFileContents(expectedPath, {
      removeWhitespace
    });
  });
  delete process.env['RWJS_CWD'];
};

exports.matchFolderTransform = matchFolderTransform;