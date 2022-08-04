"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.getTasks = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _flatMap = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/flat-map"));

var _flat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/flat"));

var _repeat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/repeat"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _paths = require("@redwoodjs/internal/dist/paths");

var _prerender = require("@redwoodjs/prerender");

var _detection = require("@redwoodjs/prerender/detection");

var _telemetry = require("@redwoodjs/telemetry");

var _colors = _interopRequireDefault(require("../lib/colors"));

var _exec = require("../lib/exec");

class PathParamError extends Error {}

const mapRouterPathToHtml = routerPath => {
  if (routerPath === '/') {
    return 'web/dist/index.html';
  } else {
    return `web/dist${routerPath}.html`;
  }
};

function getRouteHooksFilePath(routeFilePath) {
  const routeHooksFilePathTs = routeFilePath.replace(/\.(js|tsx)$/, '.routeHooks.ts');

  if (_fs.default.existsSync(routeHooksFilePathTs)) {
    return routeHooksFilePathTs;
  }

  const routeHooksFilePathJs = routeFilePath.replace(/\.(js|tsx)$/, '.routeHooks.js');

  if (_fs.default.existsSync(routeHooksFilePathJs)) {
    return routeHooksFilePathJs;
  }

  return undefined;
}
/**
 * Takes a route with a path like /blog-post/{id:Int}
 * Reads path parameters from BlogPostPage.routeHooks.js and returns a list of
 * routes with the path parameter placeholders (like {id:Int}) replaced by
 * actual values
 *
 * So for values like [{ id: 1 }, { id: 2 }, { id: 3 }] (and, again, a route
 * path like /blog-post/{id:Int}) it will return three routes with the paths
 * /blog-post/1
 * /blog-post/2
 * /blog-post/3
 *
 * The paths will be strings. Parsing those path parameters to the correct
 * datatype according to the type notation ("Int" in the example above) will
 * be handled by the normal router functions, just like when rendering in a
 * client browser
 *
 * Example `route` parameter
 * {
 *   name: 'blogPost',
 *   path: '/blog-post/{id:Int}',
 *   routePath: '/blog-post/{id:Int}',
 *   hasParams: true,
 *   id: 'file:///Users/tobbe/tmp/rw-prerender-cell-ts/web/src/Routes.tsx 1959',
 *   isNotFound: false,
 *   filePath: '/Users/tobbe/tmp/rw-prerender-cell-ts/web/src/pages/BlogPostPage/BlogPostPage.tsx'
 * }
 *
 * When returning from this function, `path` in the above example will have
 * been replaced by an actual url, like /blog-post/15
 */


async function expandRouteParameters(route) {
  const routeHooksFilePath = getRouteHooksFilePath(route.filePath);

  if (!routeHooksFilePath) {
    return [route];
  }

  try {
    const routeParameters = await (0, _exec.runScriptFunction)({
      path: routeHooksFilePath,
      functionName: 'routeParameters',
      args: {
        name: route.name,
        path: route.path,
        routePath: route.routePath,
        filePath: route.filePath
      }
    });

    if (routeParameters) {
      return (0, _map.default)(routeParameters).call(routeParameters, pathParamValues => {
        var _context;

        let newPath = route.path;
        (0, _forEach.default)(_context = (0, _entries.default)(pathParamValues)).call(_context, ([paramName, paramValue]) => {
          newPath = newPath.replace(new RegExp(`{${paramName}:?[^}]*}`), paramValue);
        });
        return { ...route,
          path: newPath
        };
      });
    }
  } catch {
    return [route];
  }

  return [route];
} // This is used directly in build.js for nested ListrTasks


const getTasks = async (dryrun, routerPathFilter = null) => {
  var _context2, _context3;

  const prerenderRoutes = (0, _filter.default)(_context2 = (0, _detection.detectPrerenderRoutes)()).call(_context2, route => route.path);

  const indexHtmlPath = _path.default.join((0, _paths.getPaths)().web.dist, 'index.html');

  if (prerenderRoutes.length === 0) {
    console.log('\nSkipping prerender...');
    console.log(_colors.default.warning('You have not marked any routes with a path as `prerender` in `Routes.{js,tsx}` \n')); // Don't error out

    return [];
  }

  if (!_fs.default.existsSync(indexHtmlPath)) {
    console.error('You must run `yarn rw build web` before trying to prerender.');
    process.exit(1); // TODO: Run this automatically at this point.
  }

  (0, _exec.configureBabel)();
  const expandedRouteParameters = await _promise.default.all((0, _map.default)(prerenderRoutes).call(prerenderRoutes, route => expandRouteParameters(route)));
  const listrTasks = (0, _flatMap.default)(_context3 = (0, _flat.default)(expandedRouteParameters).call(expandedRouteParameters)).call(_context3, routeToPrerender => {
    // Filter out routes that don't match the supplied routePathFilter
    if (routerPathFilter && routeToPrerender.path !== routerPathFilter) {
      return [];
    }

    const outputHtmlPath = mapRouterPathToHtml(routeToPrerender.path); // queryCache will be filled with the queries from all the Cells we
    // encounter while prerendering, and the result from executing those
    // queries.
    // We have this cache here because we can potentially reuse result data
    // between different pages. I.e. if the same query, with the same
    // variables is encountered twice, we'd only have to execute it once and
    // then just reuse the cached result the second time.

    const queryCache = {};
    return [{
      title: `Prerendering ${routeToPrerender.path} -> ${outputHtmlPath}`,
      task: async () => {
        if (/\{.*}/.test(routeToPrerender.path)) {
          throw new PathParamError('You did not provide values for all of the route ' + 'parameters. Please supply parameters via a ' + '*.routeHooks.{js,ts} file');
        }

        try {
          const prerenderedHtml = await (0, _prerender.runPrerender)({
            queryCache,
            renderPath: routeToPrerender.path
          });

          if (!dryrun) {
            (0, _prerender.writePrerenderedHtmlFile)(outputHtmlPath, prerenderedHtml);
          }
        } catch (e) {
          var _context4, _context5;

          console.log();
          console.log(_colors.default.warning('You can use `yarn rw prerender --dry-run` to debug'));
          console.log();
          console.log(`${_colors.default.info((0, _repeat.default)(_context4 = '-').call(_context4, 10))} Error rendering path "${routeToPrerender.path}" ${_colors.default.info((0, _repeat.default)(_context5 = '-').call(_context5, 10))}`);
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
    failure: _fs.default.existsSync(_path.default.join((0, _paths.getPaths)().web.base, 'node_modules/react'))
  }, {
    message: 'Duplicate react-dom version found in web/node_modules',
    failure: _fs.default.existsSync(_path.default.join((0, _paths.getPaths)().web.base, 'node_modules/react-dom'))
  }, {
    message: 'Duplicate core-js version found in web/node_modules',
    failure: _fs.default.existsSync(_path.default.join((0, _paths.getPaths)().web.base, 'node_modules/core-js'))
  }, {
    message: 'Duplicate @redwoodjs/web version found in web/node_modules',
    failure: _fs.default.existsSync(_path.default.join((0, _paths.getPaths)().web.base, 'node_modules/@redwoodjs/web'))
  }];
  console.log('Running diagnostic checks');

  if ((0, _some.default)(checks).call(checks, checks => checks.failure)) {
    var _context6, _context7, _context8;

    console.error(_colors.default.error('node_modules are being duplicated in `./web` \n'));
    console.log('⚠️  Issues found: ');
    console.log((0, _repeat.default)(_context6 = '-').call(_context6, 50));
    (0, _forEach.default)(_context7 = (0, _filter.default)(checks).call(checks, check => check.failure)).call(_context7, (check, i) => {
      console.log(`${i + 1}. ${check.message}`);
    });
    console.log((0, _repeat.default)(_context8 = '-').call(_context8, 50));
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

    if (e instanceof PathParamError) {
      console.log(_colors.default.info("- You most likely need to add or update a *.routeHooks.{js,ts} file next to the Page you're trying to prerender"));
    } else {
      console.log(_colors.default.info(`- This could mean that a library you're using does not support SSR.`));
      console.log(_colors.default.info('- Avoid using `window` in the initial render path through your React components without checks. \n  See https://redwoodjs.com/docs/prerender#prerender-utils'));
    }

    console.log();
    process.exit(1);
  }
};

exports.handler = handler;