"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.filter.js");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _api = require("@redwoodjs/internal/dist/build/api");

var _validateSchema = require("@redwoodjs/internal/dist/validateSchema");

var _detection = require("@redwoodjs/prerender/detection");

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

var _generatePrismaClient = require("../lib/generatePrismaClient");

var _prerenderHandler = require("./prerenderHandler");

const handler = async ({
  side = ['api', 'web'],
  verbose = false,
  performance = false,
  stats = false,
  prisma = true,
  prerender
}) => {
  const rwjsPaths = (0, _lib.getPaths)();

  if (performance) {
    console.log('Measuring Web Build Performance...');

    _execa.default.sync(`yarn cross-env NODE_ENV=production webpack --config ${require.resolve('@redwoodjs/core/config/webpack.perf.js')}`, {
      stdio: 'inherit',
      shell: true,
      cwd: rwjsPaths.web.base
    }); // We do not want to continue building...


    return;
  }

  if (stats) {
    console.log('Building Web Stats...');

    _execa.default.sync(`yarn cross-env NODE_ENV=production webpack --config ${require.resolve('@redwoodjs/core/config/webpack.stats.js')}`, {
      stdio: 'inherit',
      shell: true,
      cwd: rwjsPaths.web.base
    }); // We do not want to continue building...


    return;
  }

  const tasks = [side.includes('api') && prisma && {
    title: 'Generating Prisma Client...',
    task: async () => {
      const {
        cmd,
        args
      } = (0, _generatePrismaClient.generatePrismaCommand)(rwjsPaths.api.dbSchema);
      return (0, _execa.default)(cmd, args, {
        stdio: verbose ? 'inherit' : 'pipe',
        shell: true,
        cwd: rwjsPaths.api.base
      });
    }
  }, side.includes('api') && {
    title: 'Verifying graphql schema...',
    task: _validateSchema.loadAndValidateSdls
  }, side.includes('api') && {
    title: 'Building API...',
    task: () => {
      const {
        errors,
        warnings
      } = (0, _api.buildApi)();

      if (errors.length) {
        console.error(errors);
      }

      if (warnings.length) {
        console.warn(warnings);
      }
    }
  }, side.includes('web') && {
    // Clean web
    title: 'Cleaning Web...',
    task: () => {
      _rimraf.default.sync(rwjsPaths.web.dist);
    }
  }, side.includes('web') && {
    title: 'Building Web...',
    task: async () => {
      await (0, _execa.default)(`yarn cross-env NODE_ENV=production webpack --config ${require.resolve('@redwoodjs/core/config/webpack.production.js')}`, {
        stdio: verbose ? 'inherit' : 'pipe',
        shell: true,
        cwd: rwjsPaths.web.base
      });
      console.log('Creating 200.html...');

      const indexHtmlPath = _path.default.join((0, _lib.getPaths)().web.dist, 'index.html');

      _fs.default.copyFileSync(indexHtmlPath, _path.default.join((0, _lib.getPaths)().web.dist, '200.html'));
    }
  }, side.includes('web') && prerender && {
    title: 'Prerendering Web...',
    task: async () => {
      const prerenderRoutes = (0, _detection.detectPrerenderRoutes)();

      if (prerenderRoutes.length === 0) {
        return `You have not marked any "prerender" in your ${(0, _terminalLink.default)('Routes', 'file://' + rwjsPaths.web.routes)}.`;
      }

      return new _listr.default(await (0, _prerenderHandler.getTasks)(), {
        renderer: verbose && _listrVerboseRenderer.default,
        concurrent: true // Re-use prerender tasks, but run them in parallel to speed things up

      });
    }
  }].filter(Boolean);
  const jobs = new _listr.default(tasks, {
    renderer: verbose && _listrVerboseRenderer.default
  });

  try {
    await (0, _telemetry.timedTelemetry)(process.argv, {
      type: 'build'
    }, async () => {
      await jobs.run();
    });
  } catch (e) {
    console.log(_colors.default.error(e.message));
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    process.exit(1);
  }
};

exports.handler = handler;