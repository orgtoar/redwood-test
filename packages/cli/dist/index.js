#!/usr/bin/env node
"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/set-timeout"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/slice"));
var _path = _interopRequireDefault(require("path"));
var _api = require("@opentelemetry/api");
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _helpers = require("yargs/helpers");
var _yargs = _interopRequireDefault(require("yargs/yargs"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var buildCommand = _interopRequireWildcard(require("./commands/build"));
var checkCommand = _interopRequireWildcard(require("./commands/check"));
var consoleCommand = _interopRequireWildcard(require("./commands/console"));
var deployCommand = _interopRequireWildcard(require("./commands/deploy"));
var destroyCommand = _interopRequireWildcard(require("./commands/destroy"));
var devCommand = _interopRequireWildcard(require("./commands/dev"));
var execCommand = _interopRequireWildcard(require("./commands/exec"));
var experimentalCommand = _interopRequireWildcard(require("./commands/experimental"));
var generateCommand = _interopRequireWildcard(require("./commands/generate"));
var infoCommand = _interopRequireWildcard(require("./commands/info"));
var lintCommand = _interopRequireWildcard(require("./commands/lint"));
var prerenderCommand = _interopRequireWildcard(require("./commands/prerender"));
var prismaCommand = _interopRequireWildcard(require("./commands/prisma"));
var recordCommand = _interopRequireWildcard(require("./commands/record"));
var serveCommand = _interopRequireWildcard(require("./commands/serve"));
var setupCommand = _interopRequireWildcard(require("./commands/setup"));
var studioCommand = _interopRequireWildcard(require("./commands/studio"));
var testCommand = _interopRequireWildcard(require("./commands/test"));
var tstojsCommand = _interopRequireWildcard(require("./commands/ts-to-js"));
var typeCheckCommand = _interopRequireWildcard(require("./commands/type-check"));
var upgradeCommand = _interopRequireWildcard(require("./commands/upgrade"));
var _lib = require("./lib");
var _exit = require("./lib/exit");
var _loadEnvFiles = require("./lib/loadEnvFiles");
var updateCheck = _interopRequireWildcard(require("./lib/updateCheck"));
var _plugin = require("./plugin");
var _index = require("./telemetry/index");
// # Setting the CWD
//
// The current working directory can be set via:
//
// 1. The `--cwd` option
// 2. The `RWJS_CWD` env-var
// 3. By traversing directories upwards for the first `redwood.toml`
//
// ## Examples
//
// ```
// yarn rw info --cwd /path/to/project
// RWJS_CWD=/path/to/project yarn rw info
//
// # In this case, `--cwd` wins out over `RWJS_CWD`
// RWJS_CWD=/path/to/project yarn rw info --cwd /path/to/other/project
//
// # Here we traverses upwards for a redwood.toml.
// cd api
// yarn rw info
// ```

let {
  cwd,
  telemetry,
  help,
  version
} = (0, _helpers.Parser)((0, _helpers.hideBin)(process.argv), {
  // Telemetry is enabled by default, but can be disabled in two ways
  // - by passing a `--telemetry false` option
  // - by setting a `REDWOOD_DISABLE_TELEMETRY` env var
  boolean: ['telemetry'],
  default: {
    telemetry: process.env.REDWOOD_DISABLE_TELEMETRY === undefined || process.env.REDWOOD_DISABLE_TELEMETRY === ''
  }
});
cwd ??= process.env.RWJS_CWD;
try {
  if (cwd) {
    // `cwd` was set by the `--cwd` option or the `RWJS_CWD` env var. In this case,
    // we don't want to find up for a `redwood.toml` file. The `redwood.toml` should just be in that directory.
    if (!_fsExtra.default.existsSync(_path.default.join(cwd, 'redwood.toml'))) {
      throw new Error(`Couldn't find a "redwood.toml" file in ${cwd}`);
    }
  } else {
    // `cwd` wasn't set. Odds are they're in a Redwood project,
    // but they could be in ./api or ./web, so we have to find up to be sure.

    const redwoodTOMLPath = (0, _lib.findUp)('redwood.toml');
    if (!redwoodTOMLPath) {
      throw new Error(`Couldn't find up a "redwood.toml" file from ${process.cwd()}`);
    }
    cwd = _path.default.dirname(redwoodTOMLPath);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
process.env.RWJS_CWD = cwd;

// Load .env.* files.
//
// This should be done as early as possible, and the earliest we can do it is after setting `cwd`.
(0, _loadEnvFiles.loadEnvFiles)();
async function main() {
  // Start telemetry if it hasn't been disabled
  if (telemetry) {
    (0, _index.startTelemetry)();
  }

  // Execute CLI within a span, this will be the root span
  const tracer = _api.trace.getTracer('redwoodjs');
  await tracer.startActiveSpan('cli', async span => {
    // Ensure telemetry ends after a maximum of 5 minutes
    const telemetryTimeoutTimer = (0, _setTimeout2.default)(() => {
      (0, _index.shutdownTelemetry)();
    }, 5 * 60_000);

    // Record if --version or --help was given because we will never hit a handler which could specify the command
    if (version) {
      (0, _cliHelpers.recordTelemetryAttributes)({
        command: '--version'
      });
    }
    if (help) {
      (0, _cliHelpers.recordTelemetryAttributes)({
        command: '--help'
      });
    }

    // FIXME: There's currently a BIG RED BOX on exiting feServer
    // Is yargs or the RW cli not passing SigInt on to the child process?
    try {
      // Run the command via yargs
      await runYargs();
    } catch (error) {
      (0, _exit.exitWithError)(error);
    }

    // Span housekeeping
    if (span?.isRecording()) {
      span?.setStatus({
        code: _api.SpanStatusCode.OK
      });
      span?.end();
    }

    // Clear the timeout timer since we haven't timed out
    clearTimeout(telemetryTimeoutTimer);
  });

  // Shutdown telemetry, ensures data is sent before the process exits
  if (telemetry) {
    (0, _index.shutdownTelemetry)();
  }
}
async function runYargs() {
  var _context, _context2;
  // # Build the CLI yargs instance
  const yarg = (0, _yargs.default)((0, _helpers.hideBin)(process.argv))
  // Config
  .scriptName('rw').middleware((0, _filter.default)(_context = [
  // We've already handled `cwd` above, but it may still be in `argv`.
  // We don't need it anymore so let's get rid of it.
  // Likewise for `telemetry`.
  argv => {
    delete argv.cwd;
    delete argv.addEnvFiles;
    delete argv['load-env-files'];
    delete argv.telemetry;
  }, telemetry && _telemetry.telemetryMiddleware, updateCheck.isEnabled() && updateCheck.updateCheckMiddleware]).call(_context, Boolean)).option('cwd', {
    describe: 'Working directory to use (where `redwood.toml` is located)'
  }).option('load-env-files', {
    describe: 'Load additional .env files. Values defined in files specified later override earlier ones.',
    array: true
  }).example('yarn rw exec migrateUsers --load-env-files stripe nakama', "Run a script, also loading env vars from '.env.stripe' and '.env.nakama'").option('telemetry', {
    describe: 'Whether to send anonymous usage telemetry to RedwoodJS',
    boolean: true
    // hidden: true,
  }).example('yarn rw g page home /', "Create a page component named 'Home' at path '/'").demandCommand().strict().exitProcess(false).alias('h', 'help')

  // Commands (Built in or pre-plugin support)
  .command(buildCommand).command(checkCommand).command(consoleCommand).command(deployCommand).command(destroyCommand).command(devCommand).command(execCommand).command(experimentalCommand).command(generateCommand).command(infoCommand).command(lintCommand).command(prerenderCommand).command(prismaCommand).command(recordCommand).command(serveCommand).command(setupCommand).command(studioCommand).command(testCommand).command(tstojsCommand).command(typeCheckCommand).command(upgradeCommand);

  // Load any CLI plugins
  await (0, _plugin.loadPlugins)(yarg);

  // Run
  await yarg.parse((0, _slice.default)(_context2 = process.argv).call(_context2, 2), {}, (err, _argv, output) => {
    // Configuring yargs with `strict` makes it error on unknown args;
    // here we're signaling that with an exit code.
    if (err) {
      process.exitCode = 1;
    }

    // Show the output that yargs was going to if there was no callback provided
    if (output) {
      if (err) {
        console.error(output);
      } else {
        console.log(output);
      }
    }
  });
}
main();