"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _rimraf = require("rimraf");
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _api = require("@redwoodjs/internal/dist/build/api");
var _generate = require("@redwoodjs/internal/dist/generate/generate");
var _validateSchema = require("@redwoodjs/internal/dist/validateSchema");
var _detection = require("@redwoodjs/prerender/detection");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../lib");
var _generatePrismaClient = require("../lib/generatePrismaClient");
const handler = async ({
  side = ['api', 'web'],
  verbose = false,
  performance = false,
  stats = false,
  prisma = true,
  prerender
}) => {
  var _context, _context2;
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'build',
    side: (0, _stringify.default)(side),
    verbose,
    performance,
    stats,
    prisma,
    prerender
  });
  const rwjsPaths = (0, _lib.getPaths)();
  const rwjsConfig = (0, _lib.getConfig)();
  const useFragments = rwjsConfig.graphql?.fragments;
  const useTrustedDocuments = rwjsConfig.graphql?.trustedDocuments;
  if (performance) {
    console.log('Measuring Web Build Performance...');
    _execa.default.sync(`yarn cross-env NODE_ENV=production webpack --config ${require.resolve('@redwoodjs/core/config/webpack.perf.js')}`, {
      stdio: 'inherit',
      shell: true,
      cwd: rwjsPaths.web.base
    });
    // We do not want to continue building...
    return;
  }
  if (stats) {
    console.log('Building Web Stats...');
    _execa.default.sync(`yarn cross-env NODE_ENV=production webpack --config ${require.resolve('@redwoodjs/core/config/webpack.stats.js')}`, {
      stdio: 'inherit',
      shell: true,
      cwd: rwjsPaths.web.base
    });
    // We do not want to continue building...
    return;
  }
  const prismaSchemaExists = _fsExtra.default.existsSync(rwjsPaths.api.dbSchema);
  const prerenderRoutes = prerender && (0, _includes.default)(side).call(side, 'web') ? (0, _detection.detectPrerenderRoutes)() : [];
  const shouldGeneratePrismaClient = prisma && prismaSchemaExists && ((0, _includes.default)(side).call(side, 'api') || prerenderRoutes.length > 0);
  const tasks = (0, _filter.default)(_context = [shouldGeneratePrismaClient && {
    title: 'Generating Prisma Client...',
    task: () => {
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
  },
  // If using GraphQL Fragments or Trusted Documents, then we need to use
  // codegen to generate the types needed for possible types and the
  // trusted document store hashes
  (useFragments || useTrustedDocuments) && {
    title: `Generating types needed for ${(0, _filter.default)(_context2 = [useFragments && 'GraphQL Fragments', useTrustedDocuments && 'Trusted Documents']).call(_context2, Boolean).join(' and ')} support...`,
    task: async () => {
      await (0, _generate.generate)();
    }
  }, (0, _includes.default)(side).call(side, 'api') && {
    title: 'Verifying graphql schema...',
    task: _validateSchema.loadAndValidateSdls
  }, (0, _includes.default)(side).call(side, 'api') && {
    title: 'Building API...',
    task: async () => {
      await (0, _api.cleanApiBuild)();
      const {
        errors,
        warnings
      } = await (0, _api.buildApi)();
      if (errors.length) {
        console.error(errors);
      }
      if (warnings.length) {
        console.warn(warnings);
      }
    }
  }, (0, _includes.default)(side).call(side, 'web') && {
    // Clean web/dist before building
    // Vite handles this internally
    title: 'Cleaning Web...',
    task: () => {
      return (0, _rimraf.rimraf)(rwjsPaths.web.dist);
    },
    enabled: (0, _lib.getConfig)().web.bundler === 'webpack'
  }, (0, _includes.default)(side).call(side, 'web') && {
    title: 'Building Web...',
    task: async () => {
      if ((0, _lib.getConfig)().web.bundler !== 'webpack') {
        // @NOTE: we're using the vite build command here, instead of the
        // buildWeb function directly because we want the process.cwd to be
        // the web directory, not the root of the project.
        // This is important for postcss/tailwind to work correctly
        // Having a separate binary lets us contain the change of cwd to that
        // process only. If we changed cwd here, or in the buildWeb function,
        // it could affect other things that run in parallel while building.
        // We don't have any parallel tasks right now, but someone might add
        // one in the future as a performance optimization.
        //
        // Disable the new warning in Vite v5 about the CJS build being deprecated
        // so that users don't have to see it when this command is called with --verbose
        process.env.VITE_CJS_IGNORE_WARNING = 'true';
        await (0, _execa.default)(`node ${require.resolve('@redwoodjs/vite/bins/rw-vite-build.mjs')} --webDir="${rwjsPaths.web.base}" --verbose=${verbose}`, {
          stdio: verbose ? 'inherit' : 'pipe',
          shell: true,
          // `cwd` is needed for yarn to find the rw-vite-build binary
          // It won't change process.cwd for anything else here, in this
          // process
          cwd: rwjsPaths.web.base
        });
      } else {
        await (0, _execa.default)(`yarn cross-env NODE_ENV=production webpack --config ${require.resolve('@redwoodjs/core/config/webpack.production.js')}`, {
          stdio: verbose ? 'inherit' : 'pipe',
          shell: true,
          cwd: rwjsPaths.web.base
        });
      }

      // Streaming SSR does not use the index.html file.
      if (!(0, _lib.getConfig)().experimental?.streamingSsr?.enabled) {
        console.log('Creating 200.html...');
        const indexHtmlPath = _path.default.join((0, _lib.getPaths)().web.dist, 'index.html');
        _fsExtra.default.copyFileSync(indexHtmlPath, _path.default.join((0, _lib.getPaths)().web.dist, '200.html'));
      }
    }
  }]).call(_context, Boolean);
  const triggerPrerender = async () => {
    console.log('Starting prerendering...');
    if (prerenderRoutes.length === 0) {
      console.log(`You have not marked any routes to "prerender" in your ${(0, _terminalLink.default)('Routes', 'file://' + rwjsPaths.web.routes)}.`);
      return;
    }

    // Running a separate process here, otherwise it wouldn't pick up the
    // generated Prisma Client due to require module caching
    await (0, _execa.default)('yarn rw prerender', {
      stdio: 'inherit',
      shell: true,
      cwd: rwjsPaths.web.base
    });
  };
  const jobs = new _listr.Listr(tasks, {
    renderer: verbose && 'verbose'
  });
  await (0, _telemetry.timedTelemetry)(process.argv, {
    type: 'build'
  }, async () => {
    await jobs.run();
    if ((0, _includes.default)(side).call(side, 'web') && prerender && prismaSchemaExists) {
      // This step is outside Listr so that it prints clearer, complete messages
      await triggerPrerender();
    }
  });
};
exports.handler = handler;