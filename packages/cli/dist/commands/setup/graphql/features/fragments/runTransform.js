"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.runTransform = void 0;
var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));
var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));
var jscodeshift = _interopRequireWildcard(require("jscodeshift/src/Runner"));
/**
 * A simple wrapper around jscodeshift.
 *
 * @see jscodeshift JS usage {@link https://github.com/facebook/jscodeshift#usage-js}
 * @see prisma/codemods {@link https://github.com/prisma/codemods/blob/main/utils/runner.ts}
 * @see react-codemod {@link https://github.com/reactjs/react-codemod/blob/master/bin/cli.js}
 */

// jscodeshift has an `Options` type export we could use here, but currently
// it's just a map of anys, so not really useful. In our case, leaving that
// type out is actually better and leads to stronger typings for `runTransform`
const defaultJscodeshiftOpts = {
  // 0, 1 or 2
  verbose: 0,
  dry: false,
  // Doesn't do anything when running programmatically
  print: false,
  babel: true,
  extensions: 'js,ts,jsx,tsx',
  ignorePattern: '**/node_modules/**',
  ignoreConfig: [],
  runInBand: false,
  silent: true,
  parser: 'babel',
  parserConfig: {},
  // `silent` has to be `false` for this option to do anything
  failOnError: false,
  stdin: false
};
const runTransform = async ({
  transformPath,
  targetPaths,
  parser = 'tsx',
  options = {}
}) => {
  // We have to do this here for the tests, because jscodeshift.run actually
  // spawns a different process. If we use getPaths() in the transform, it
  // would not find redwood.toml
  if (process.env.NODE_ENV === 'test' && process.env.RWJS_CWD) {
    process.chdir(process.env.RWJS_CWD);
  }

  // Unfortunately this seems to be the only way to capture output from
  // jscodeshift
  const {
    output,
    stdoutWrite
  } = patchStdoutWrite();
  const result = await jscodeshift.run(transformPath, targetPaths, {
    ...defaultJscodeshiftOpts,
    parser,
    babel: process.env.NODE_ENV === 'test',
    ...options // Putting options here lets users override all the defaults.
  });
  restoreStdoutWrite(stdoutWrite);
  let error;
  if (result.error) {
    var _context;
    // If there is an error it's going to be the first line that starts with
    // "Error: "
    error = (0, _find.default)(_context = output.value.split('\n')).call(_context, line => (0, _startsWith.default)(line).call(line, 'Error: '))?.slice('Error: '.length);
  }
  return {
    ...result,
    error,
    output: output.value
  };
};
exports.runTransform = runTransform;
function patchStdoutWrite() {
  const stdoutWrite = process.stdout.write;
  const output = {
    value: ''
  };
  process.stdout.write = chunk => {
    if (typeof chunk === 'string') {
      output.value += chunk;
    }
    return true;
  };
  return {
    output,
    stdoutWrite
  };
}
function restoreStdoutWrite(stdoutWrite) {
  process.stdout.write = stdoutWrite;
}