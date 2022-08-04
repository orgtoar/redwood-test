"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.registerBabel = exports.getCommonPlugins = exports.RUNTIME_CORE_JS_VERSION = exports.CORE_JS_VERSION = void 0;

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));

var _context;

const pkgJson = require('../../../package.json');

/** NOTE:
 * We do this so we still get types, but don't import babel/register
 * Importing babel/register in typescript (instead of requiring) has dire consequences..

  Lets say we use the import syntax: import babelRequireHook from '@babel/register'
  - if your import in a JS file (like we used to in the cli project) - not a problem, and it would only invoke the register function when you called babelRequireHook
  - if you import in a TS file, the transpile process modifies it when we build the framework -
    so it will invoke it once as soon as you import, and another time when you use babelRequireHook...
    BUTTT!!! you won't notice it if your project is TS because by default it ignore .ts and .tsx files, but if its a JS project, it would try to transpile twice
 *
 *
 *
**/
const registerBabel = options => {
  require('@babel/register')(options);
};

exports.registerBabel = registerBabel;
const CORE_JS_VERSION = (0, _slice.default)(_context = pkgJson.dependencies['core-js'].split('.')).call(_context, 0, 2).join('.'); // Produces: 3.12, instead of 3.12.1

exports.CORE_JS_VERSION = CORE_JS_VERSION;

if (!CORE_JS_VERSION) {
  throw new Error('RedwoodJS Project Babel: Could not determine core-js version.');
}

const RUNTIME_CORE_JS_VERSION = pkgJson.dependencies['@babel/runtime-corejs3'];
exports.RUNTIME_CORE_JS_VERSION = RUNTIME_CORE_JS_VERSION;

if (!RUNTIME_CORE_JS_VERSION) {
  throw new Error('RedwoodJS Project Babel: Could not determine core-js runtime version');
}

const getCommonPlugins = () => {
  return [['@babel/plugin-proposal-class-properties', {
    loose: true
  }], // Note: The private method loose mode configuration setting must be the
  // same as @babel/plugin-proposal class-properties.
  // (https://babeljs.io/docs/en/babel-plugin-proposal-private-methods#loose)
  ['@babel/plugin-proposal-private-methods', {
    loose: true
  }], ['@babel/plugin-proposal-private-property-in-object', {
    loose: true
  }]];
};

exports.getCommonPlugins = getCommonPlugins;