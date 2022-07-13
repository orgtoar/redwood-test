"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.getTasks = exports.description = exports.command = exports.builder = exports.aliases = void 0;

var _flatMap = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/flat-map"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _repeat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/repeat"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _internal = require("@redwoodjs/internal");

var _prerender = require("@redwoodjs/prerender");

var _detection = require("@redwoodjs/prerender/detection");

var _telemetry = require("@redwoodjs/telemetry");

var _colors = _interopRequireDefault(require("../lib/colors"));

const command = 'prerender';
exports.command = command;
const aliases = ['render'];
exports.aliases = aliases;
const description = 'Prerender pages of your Redwood app at build time';
exports.description = description;

const builder = yargs => {
  yargs.showHelpOnFail(false);
  yargs.option('path', {
    alias: ['p', 'route'],
    description: 'Router path to prerender. Especially useful for debugging',
    type: 'string'
  });
  yargs.option('dry-run', {
    alias: ['d', 'dryrun'],
    default: false,
    description: 'Run prerender and output to console',
    type: 'boolean'
  });
  yargs.option('verbose', {
    alias: 'v',
    default: false,
    description: 'Print more',
    type: 'boolean'
  });
};

exports.builder = builder;

const mapRouterPathToHtml = routerPath => {
  if (routerPath === '/') {
    return 'web/dist/index.html';
  } else {
    return `web/dist${routerPath}.html`;
  }
}; // This is used directly in build.js for nested ListrTasks


const getTasks = async (dryrun, routerPathFilter = null) => {
  var _context;

  const prerenderRoutes = (0, _detection.detectPrerenderRoutes)();

  const indexHtmlPath = _path.default.join((0, _internal.getPaths)().web.dist, 'index.html');

  if (prerenderRoutes.length === 0) {
    console.log('\nSkipping prerender...');
    console.log(_colors.default.warning('You have not marked any routes as `prerender` in `Routes.{js,tsx}` \n')); // Don't error out

    return [];
  }

  if (!_fs.default.existsSync(indexHtmlPath)) {
    console.error('You must run `yarn rw build web` before trying to prerender.');
    process.exit(1); // TODO: Run this automatically at this point.
  }

  const listrTasks = (0, _flatMap.default)(_context = (0, _filter.default)(prerenderRoutes).call(prerenderRoutes, route => route.path)).call(_context, routeToPrerender => {
    // Filter out routes that don't match the supplied routePathFilter
    if (routerPathFilter && routeToPrerender.path !== routerPathFilter) {
      return [];
    }

    const outputHtmlPath = mapRouterPathToHtml(routeToPrerender.path);
    return [{
      title: `Prerendering ${routeToPrerender.path} -> ${outputHtmlPath}`,
      task: async () => {
        try {
          const prerenderedHtml = await (0, _prerender.runPrerender)({
            routerPath: routeToPrerender.path
          });

          if (!dryrun) {
            (0, _prerender.writePrerenderedHtmlFile)(outputHtmlPath, prerenderedHtml);
          }
        } catch (e) {
          var _context2, _context3;

          console.log();
          console.log(_colors.default.warning('You can use `yarn rw prerender --dry-run` to debug'));
          console.log();
          console.log(`${_colors.default.info((0, _repeat.default)(_context2 = '-').call(_context2, 10))} Error rendering path "${routeToPrerender.path}" ${_colors.default.info((0, _repeat.default)(_context3 = '-').call(_context3, 10))}`);
          (0, _telemetry.errorTelemetry)(process.argv, `Error prerendering: ${e.message}`);
          console.error(_colors.default.error(e.stack));
          console.log();
          throw new Error(`Failed to render "${routeToPrerender.filePath}"`);
        }
      }
    }];
  });
  return listrTasks;
};

exports.getTasks = getTasks;

const diagnosticCheck = () => {
  const checks = [{
    message: 'Duplicate React version found in web/node_modules',
    failure: _fs.default.existsSync(_path.default.join((0, _internal.getPaths)().web.base, 'node_modules/react'))
  }, {
    message: 'Duplicate react-dom version found in web/node_modules',
    failure: _fs.default.existsSync(_path.default.join((0, _internal.getPaths)().web.base, 'node_modules/react-dom'))
  }, {
    message: 'Duplicate core-js version found in web/node_modules',
    failure: _fs.default.existsSync(_path.default.join((0, _internal.getPaths)().web.base, 'node_modules/core-js'))
  }, {
    message: 'Duplicate @redwoodjs/web version found in web/node_modules',
    failure: _fs.default.existsSync(_path.default.join((0, _internal.getPaths)().web.base, 'node_modules/@redwoodjs/web'))
  }];
  console.log('Running diagnostic checks');

  if ((0, _some.default)(checks).call(checks, checks => checks.failure)) {
    var _context4, _context5, _context6;

    console.error(_colors.default.error('node_modules are being duplicated in `./web` \n'));
    console.log('⚠️  Issues found: ');
    console.log((0, _repeat.default)(_context4 = '-').call(_context4, 50));
    (0, _forEach.default)(_context5 = (0, _filter.default)(checks).call(checks, check => check.failure)).call(_context5, (check, i) => {
      console.log(`${i + 1}. ${check.message}`);
    });
    console.log((0, _repeat.default)(_context6 = '-').call(_context6, 50));
    console.log('Diagnostic check found issues. See the Redwood Forum link below for help:');
    console.log(_colors.default.underline('https://community.redwoodjs.com/search?q=duplicate%20package%20found'));
    console.log(); // Exit, no need to show other messages

    process.exit(1);
  } else {
    console.log('✔ Diagnostics checks passed \n');
  }
};

const handler = async ({
  path: routerPath,
  dryRun,
  verbose
}) => {
  const listrTasks = await getTasks(dryRun, routerPath);
  const tasks = new _listr.default(listrTasks, {
    renderer: verbose ? _listrVerboseRenderer.default : 'default'
  });

  try {
    if (dryRun) {
      console.log(_colors.default.info('::: Dry run, not writing changes :::'));
    }

    await tasks.run();
  } catch (e) {
    console.log();
    await diagnosticCheck();
    console.log(_colors.default.warning('Tips:'));
    console.log(_colors.default.info(`- This could mean that a library you're using does not support SSR.`));
    console.log(_colors.default.info('- Avoid using `window` in the initial render path through your React components without checks. \n  See https://redwoodjs.com/docs/prerender#prerender-utils'));
    console.log();
    process.exit(1);
  }
};

exports.handler = handler;