"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = configureStorybook;

var _reverse = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reverse"));

var _findIndex = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find-index"));

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/splice"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _ = require(".");

/**
 * Configure Storybook for the given template by creating a custom preview config
 */
function configureStorybook({
  force
}, newStorybookPreview) {
  const storybookPreviewConfigPath = (0, _.getPaths)().web.storybookPreviewConfig;
  let storybookPreviewConfig;
  /**
   *  Check if storybookPreviewConfigPath already exists.
   *  Merge both files if it does.
   *  By removing import react and export decorator from new config
   *  And put new config inside current config after last import
   */

  if (_fsExtra.default.existsSync(storybookPreviewConfigPath)) {
    if (force) {
      _fsExtra.default.unlinkSync(storybookPreviewConfigPath);

      storybookPreviewConfig = newStorybookPreview;
    } else {
      var _context;

      const currentConfig = _fsExtra.default.readFileSync(storybookPreviewConfigPath).toString();

      const newDecoratorsName = newStorybookPreview.match(/export const decorators = \[(.*?)\]/)[1];
      const currentDecoratorsName = currentConfig.match(/export const decorators = \[(.*?)\]/)[1];
      const decoratorsExport = `export const decorators = [${currentDecoratorsName}, ${newDecoratorsName}]`;
      const insideNewStorybookConfigWithoutReactAndDecoration = newStorybookPreview.replace(/import \* as React from 'react'/, '').replace(/export const decorators = .*/, '');
      const currentConfigWithoutDecoration = currentConfig.replace(/export const decorators = .*/, '');
      const reversedCurrentConfig = (0, _reverse.default)(_context = currentConfigWithoutDecoration.split('\n')).call(_context);
      const indexOfLastImport = (0, _findIndex.default)(reversedCurrentConfig).call(reversedCurrentConfig, value => /^import /.test(value));
      (0, _splice.default)(reversedCurrentConfig).call(reversedCurrentConfig, indexOfLastImport, 0, insideNewStorybookConfigWithoutReactAndDecoration);
      storybookPreviewConfig = (0, _reverse.default)(reversedCurrentConfig).call(reversedCurrentConfig).join(`\n`) + `\n` + currentConfig + `\n` + decoratorsExport;
    }
  } else {
    storybookPreviewConfig = newStorybookPreview;
  }

  _fsExtra.default.outputFileSync(storybookPreviewConfigPath, storybookPreviewConfig);
}