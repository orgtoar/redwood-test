"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runTransform = exports.default = void 0;

var jscodeshift = _interopRequireWildcard(require("jscodeshift/src/Runner"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * A simple wrapper around the jscodeshift.
 *
 * @see jscodeshift CLI's usage {@link https://github.com/facebook/jscodeshift#usage-cli}
 * @see prisma/codemods {@link https://github.com/prisma/codemods/blob/main/utils/runner.ts}
 * @see react-codemod {@link https://github.com/reactjs/react-codemod/blob/master/bin/cli.js}
 */
// @ts-expect-error We don't have this in types but need for workaround https://github.com/facebook/jscodeshift/issues/398
const defaultJscodeshiftOpts = {
  verbose: 0,
  dry: false,
  print: false,
  babel: true,
  extensions: 'js',
  ignorePattern: '**/node_modules/**',
  ignoreConfig: [],
  runInBand: false,
  silent: false,
  parser: 'babel',
  parserConfig: {},
  failOnError: false,
  stdin: false
};

const runTransform = async ({
  transformPath,
  targetPaths,
  parser = 'tsx',
  options = {}
}) => {
  try {
    await jscodeshift.run(transformPath, targetPaths, { ...defaultJscodeshiftOpts,
      parser,
      babel: process.env.NODE_ENV === 'test',
      ...options // Putting options here lets them override all the defaults.

    });
  } catch (e) {
    console.error('Transform Error', e.message);
    throw new Error('Failed to invoke transform');
  }
};

exports.runTransform = runTransform;
var _default = runTransform;
exports.default = _default;