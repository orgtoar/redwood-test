"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeBabelConfig = exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

var _prettify = _interopRequireDefault(require("../../../lib/prettify"));

const removeBabelConfig = async () => {
  const rootBabelConfigPath = _path.default.join((0, _getRWPaths.default)().base, 'babel.config.js');

  const webBabelRcPath = _path.default.join((0, _getRWPaths.default)().web.base, '.babelrc.js');

  const webBabelConfigPath = _path.default.join((0, _getRWPaths.default)().web.base, 'babel.config.js'); // Remove root babel config


  if (_fs.default.existsSync(rootBabelConfigPath)) {
    var _rootConfig$presets;

    const rootConfig = require(rootBabelConfigPath); // If the rootConfig is the default, we can remove it


    if (Object.keys(rootConfig).length === 1 && ((_rootConfig$presets = rootConfig.presets) === null || _rootConfig$presets === void 0 ? void 0 : _rootConfig$presets[0]) === '@redwoodjs/core/config/babel-preset') {
      console.log('Removing root babel.config.js');

      _fs.default.rmSync(rootBabelConfigPath);
    } else {
      // They have custom config in the root babel.config
      // Fail and ask them to move config manually
      console.warn('Detected custom config in your root babel.config.js');
      throw new Error('Cannot automatically codemod your project. Please move your root babel.config.js settings manually');
    }
  }

  if (_fs.default.existsSync(webBabelRcPath)) {
    const webConfig = require(webBabelRcPath); // If its the default .babelrc.js


    if (Object.keys(webConfig).length === 1 && webConfig.extends === '../babel.config.js') {
      console.log('Removing web .babelrc.js');

      _fs.default.rmSync(webBabelRcPath);
    } else {
      // Rename .babelrc to babel.config.js
      _fs.default.rmSync(webBabelRcPath); // And remove extends  from the config


      if (webConfig.extends) {
        const {
          extends: _ignore,
          ...otherConfig
        } = webConfig;
        const newConfig = `module.exports = ${JSON.stringify(otherConfig)}`;

        _fs.default.writeFileSync(webBabelConfigPath, (0, _prettify.default)(newConfig));
      }
    }
  }
};

exports.removeBabelConfig = removeBabelConfig;
var _default = removeBabelConfig;
exports.default = _default;