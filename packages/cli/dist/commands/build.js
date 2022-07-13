"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = void 0;

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _internal = require("@redwoodjs/internal");

var _detection = require("@redwoodjs/prerender/detection");

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

var _generatePrismaClient = require("../lib/generatePrismaClient");

var _checkForBabelConfig = _interopRequireDefault(require("../middleware/checkForBabelConfig"));

var _prerender = require("./prerender");

const command = 'build [side..]';
exports.command = command;
const description = 'Build for production';
exports.description = description;

const builder = yargs => {
  const apiExists = _fs.default.existsSync((0, _lib.getPaths)().api.src);

  const webExists = _fs.default.existsSync((0, _lib.getPaths)().web.src);

  const optionDefault = (apiExists, webExists) => {
    let options = [];

    if (apiExists) {
      options.push('api');
    }

    if (webExists) {
      options.push('web');
    }

    return options;
  };

  yargs.positional('side', {
    choices: ['api', 'web'],
    default: optionDefault(apiExists, webExists),
    description: 'Which side(s) to build',
    type: 'array'
  }).option('stats', {
    default: false,
    description: `Use ${(0, _terminalLink.default)('Webpack Bundle Analyzer', 'https://github.com/webpack-contrib/webpack-bundle-analyzer')}`,
    type: 'boolean'
  }).option('verbose', {
    alias: 'v',
    default: false,
    description: 'Print more',
    type: 'boolean'
  }).option('prerender', {
    default: true,
    description: 'Prerender after building web',
    type: 'boolean'
  }).option('prisma', {
    type: 'boolean',
    alias: 'db',
    default: true,
    description: 'Generate the Prisma client'
  }).option('performance', {
    alias: 'perf',
    type: 'boolean',
    default: false,
    description: 'Measure build performance'
  }).middleware(_checkForBabelConfig.default).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#build')}`);
};

exports.builder = builder;

const handler = async ({
  side = ['api', 'web'],
  verbose = false,
  performance = false,
  stats = false,
  prisma = true,
  prerender
}) => {
  var _context;

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

  const tasks = (0, _filter.default)(_context = [(0, _includes.default)(side).call(side, 'api') && prisma && {
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
  }, (0, _includes.default)(side).call(side, 'api') && {
    title: 'Verifying graphql schema...',
    task: _internal.loadAndValidateSdls
  }, (0, _includes.default)(side).call(side, 'api') && {
    title: 'Building API...',
    task: () => {
      const {
        errors,
        warnings
      } = (0, _internal.buildApi)();

      if (errors.length) {
        console.error(errors);
      }

      if (warnings.length) {
        console.warn(warnings);
      }
    }
  }, (0, _includes.default)(side).call(side, 'web') && {
    // Clean web
    title: 'Cleaning Web...',
    task: () => {
      _rimraf.default.sync(rwjsPaths.web.dist);
    }
  }, (0, _includes.default)(side).call(side, 'web') && {
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
  }, (0, _includes.default)(side).call(side, 'web') && prerender && {
    title: 'Prerendering Web...',
    task: async () => {
      const prerenderRoutes = (0, _detection.detectPrerenderRoutes)();

      if (prerenderRoutes.length === 0) {
        return `You have not marked any "prerender" in your ${(0, _terminalLink.default)('Routes', 'file://' + rwjsPaths.web.routes)}.`;
      }

      return new _listr.default(await (0, _prerender.getTasks)(), {
        renderer: verbose && _listrVerboseRenderer.default,
        concurrent: true // Re-use prerender tasks, but run them in parallel to speed things up

      });
    }
  }]).call(_context, Boolean);
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