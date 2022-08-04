"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _path = _interopRequireDefault(require("path"));

var _concurrently = _interopRequireDefault(require("concurrently"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _upgrade = require("../commands/upgrade");

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

var _generatePrismaClient = require("../lib/generatePrismaClient");

const handler = async ({
  sides,
  verbose,
  prisma,
  generate
}) => {
  /**
   * Check types for the project directory : [web, api]
   */
  const typeCheck = async () => {
    let conclusiveExitCode = 0;
    const yarnVersion = await (0, _upgrade.getCmdMajorVersion)('yarn');
    const tscForAllSides = (0, _map.default)(sides).call(sides, side => {
      const projectDir = _path.default.join((0, _lib.getPaths)().base, side); // -s flag to suppress error output from yarn. For example yarn doc link on non-zero status.
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
        const exitCodes = (0, _filter.default)(_context = (0, _map.default)(err).call(err, e => e === null || e === void 0 ? void 0 : e.exitCode)).call(_context, Boolean);
        conclusiveExitCode = Math.max(...exitCodes);
      }
    }

    return conclusiveExitCode;
  };

  try {
    if (generate && prisma) {
      await (0, _generatePrismaClient.generatePrismaClient)({
        verbose: verbose,
        schema: (0, _lib.getPaths)().api.dbSchema
      });
    }

    if (generate) {
      await new _listr.default([{
        title: 'Generating types',
        task: () => (0, _execa.default)('yarn rw-gen', {
          shell: true,
          stdio: verbose ? 'inherit' : 'ignore'
        })
      }]).run();
    }

    const exitCode = await typeCheck();
    exitCode > 0 && process.exit(exitCode);
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.log(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;