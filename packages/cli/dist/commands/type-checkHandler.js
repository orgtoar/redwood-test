"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _path = _interopRequireDefault(require("path"));
var _concurrently = _interopRequireDefault(require("concurrently"));
var _execa = _interopRequireDefault(require("execa"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _upgrade = require("../commands/upgrade");
var _lib = require("../lib");
var _generatePrismaClient = require("../lib/generatePrismaClient");
const handler = async ({
  sides,
  verbose,
  prisma,
  generate
}) => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'type-check',
    sides: (0, _stringify.default)(sides),
    verbose,
    prisma,
    generate
  });

  /**
   * Check types for the project directory : [web, api]
   */

  const typeCheck = async () => {
    let conclusiveExitCode = 0;
    const yarnVersion = await (0, _upgrade.getCmdMajorVersion)('yarn');
    const tscForAllSides = (0, _map.default)(sides).call(sides, side => {
      const projectDir = _path.default.join((0, _lib.getPaths)().base, side);
      // -s flag to suppress error output from yarn. For example yarn doc link on non-zero status.
      // Since it'll be printed anyways after the whole execution.
      return {
        cwd: projectDir,
        command: `yarn ${yarnVersion > 1 ? '' : '-s'} tsc --noEmit --skipLibCheck`
      };
    });
    const {
      result
    } = (0, _concurrently.default)(tscForAllSides, {
      group: true,
      raw: true
    });
    try {
      await result;
    } catch (err) {
      if (err.length) {
        var _context;
        // Non-null exit codes
        const exitCodes = (0, _filter.default)(_context = (0, _map.default)(err).call(err, e => e?.exitCode)).call(_context, Boolean);
        conclusiveExitCode = Math.max(...exitCodes);
      }
    }
    return conclusiveExitCode;
  };
  if (generate && prisma) {
    await (0, _generatePrismaClient.generatePrismaClient)({
      verbose: verbose,
      schema: (0, _lib.getPaths)().api.dbSchema
    });
  }
  if (generate) {
    await new _listr.Listr([{
      title: 'Generating types',
      task: () => (0, _execa.default)('yarn rw-gen', {
        shell: true,
        stdio: verbose ? 'inherit' : 'ignore'
      })
    }], {
      renderer: verbose && 'verbose',
      rendererOptions: {
        collapseSubtasks: false
      }
    }).run();
  }
  const exitCode = await typeCheck();
  if (exitCode > 0) {
    process.exitCode = exitCode;
  }
};
exports.handler = handler;