"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

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
    const tscForAllSides = sides.map(side => {
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
        // Non-null exit codes
        const exitCodes = err.map(e => e === null || e === void 0 ? void 0 : e.exitCode).filter(Boolean);
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