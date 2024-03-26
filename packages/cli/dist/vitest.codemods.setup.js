"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
var _globalThis2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/global-this"));
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _vitest = require("vitest");
var _testUtils = require("./testUtils");
/* eslint-env node, vitest */

// Disable telemetry within framework tests
process.env.REDWOOD_DISABLE_TELEMETRY = 1;
_globalThis2.default.matchInlineTransformSnapshot = (await import('./testUtils/matchInlineTransformSnapshot')).matchInlineTransformSnapshot;
_globalThis2.default.matchFolderTransform = (await import('./testUtils/matchFolderTransform')).matchFolderTransform;

// Custom matcher for checking fixtures using paths
// e.g. expect(transformedPath).toMatchFileContents(expectedPath)
// Mainly so we throw more helpful errors
_vitest.expect.extend({
  toMatchFileContents(receivedPath, expectedPath, {
    removeWhitespace
  } = {
    removeWhitespace: false
  }) {
    let pass = true;
    let message = '';
    try {
      let actualOutput = _fs.default.readFileSync(receivedPath, 'utf-8');
      let expectedOutput = _fs.default.readFileSync(expectedPath, 'utf-8');
      if (removeWhitespace) {
        actualOutput = actualOutput.replace(/\s/g, '');
        expectedOutput = expectedOutput.replace(/\s/g, '');
      }
      (0, _vitest.expect)((0, _testUtils.formatCode)(actualOutput)).toEqual((0, _testUtils.formatCode)(expectedOutput));
    } catch (e) {
      const relativePath = _path.default.relative(_path.default.join(__dirname, 'src/commands/setup'), expectedPath);
      pass = false;
      message = `${e}\nFile contents do not match for fixture at: \n ${relativePath}`;
    }
    return {
      pass,
      message: () => message,
      expected: expectedPath,
      received: receivedPath
    };
  }
});