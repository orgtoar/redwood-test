"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _boxen = _interopRequireDefault(require("boxen"));

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

const isUsingBabelRc = () => {
  return _fastGlob.default.sync('{web,api}/.babelrc(.*)?', {
    cwd: (0, _lib.getPaths)().base,
    ignore: '**/node_modules'
  }).length > 0;
};

const BABEL_SETTINGS_LINK = 'https://redwoodjs.com/docs/project-configuration-dev-test-build';

const checkForBabelConfig = () => {
  if (isUsingBabelRc()) {
    const messages = ["Looks like you're trying to configure one of your sides with a .babelrc file.", 'These settings will be ignored, unless you use a babel.config.js file', '', 'Your plugins and settings will be automatically merged with', `the Redwood built-in config, more details here: ${_colors.default.warning(BABEL_SETTINGS_LINK)}`];
    console.log((0, _boxen.default)(messages.join('\n'), {
      title: 'Incorrect project configuration',
      padding: {
        top: 0,
        bottom: 0,
        right: 1,
        left: 1
      },
      margin: 1,
      borderColor: 'red'
    }));
  }
};

var _default = checkForBabelConfig;
exports.default = _default;