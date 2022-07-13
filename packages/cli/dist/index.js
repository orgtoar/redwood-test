#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _dotenvDefaults = require("dotenv-defaults");

var _yargs = _interopRequireDefault(require("yargs"));

var _internal = require("@redwoodjs/internal");

var _telemetry = require("@redwoodjs/telemetry");

/**
 * The current working directory can be set via:
 * 1. A `--cwd` option
 * 2. The `RWJS_CWD` env-var
 * 3. Found by traversing directories upwards for the first `redwood.toml`
 *
 * This middleware parses, validates, and sets current working directory
 * in the order above.
 */
const getCwdMiddleware = argv => {
  let configPath;

  try {
    let cwd;

    if (argv.cwd) {
      cwd = argv.cwd; // We delete the argument because it's not actually referenced in CLI,
      // we use the `RWJS_CWD` env-var,
      // and it conflicts with "forwarding" commands such as test and prisma.

      delete argv.cwd;
    } else if (process.env.RWJS_CWD) {
      cwd = process.env.RWJS_CWD;
    } else {
      cwd = _path.default.dirname((0, _internal.getConfigPath)());
    }

    configPath = _path.default.resolve(process.cwd(), cwd, 'redwood.toml');

    if (!_fs.default.existsSync(configPath)) {
      throw new Error('Could not find `redwood.toml` config file.');
    }

    process.env.RWJS_CWD = cwd;
  } catch (e) {
    console.error();
    console.error('Error: Redwood CLI could not find your config file.');
    console.error(`Expected '${configPath}'`);
    console.error();
    console.error(`Did you run Redwood CLI in a RedwoodJS project?`);
    console.error(`Or specify an incorrect '--cwd' option?`);
    console.error();
    process.exit(1);
  }
};

const loadDotEnvDefaultsMiddleware = () => {
  (0, _dotenvDefaults.config)({
    path: _path.default.join((0, _internal.getPaths)().base, '.env'),
    defaults: _path.default.join((0, _internal.getPaths)().base, '.env.defaults'),
    encoding: 'utf8'
  });
}; // eslint-disable-next-line no-unused-expressions


_yargs.default.scriptName('rw').middleware([getCwdMiddleware, loadDotEnvDefaultsMiddleware, _telemetry.telemetryMiddleware]).option('cwd', {
  describe: 'Working directory to use (where `redwood.toml` is located.)'
}).commandDir('./commands').example('yarn rw g page home /', "\"Create a page component named 'Home' at path '/'\"").demandCommand().strict().argv;