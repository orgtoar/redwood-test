"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.transpileApi = exports.prebuildApiFiles = exports.cleanApiBuild = exports.buildApi = void 0;

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var esbuild = _interopRequireWildcard(require("esbuild"));

var _fsExtra = require("fs-extra");

var _files = require("../files");

var _paths = require("../paths");

var _api = require("./babel/api");

const buildApi = () => {
  var _context;

  // TODO: Be smarter about caching and invalidating files,
  // but right now we just delete everything.
  cleanApiBuild();
  const srcFiles = (0, _files.findApiFiles)();
  const prebuiltFiles = (0, _filter.default)(_context = prebuildApiFiles(srcFiles)).call(_context, path => path !== undefined);
  return transpileApi(prebuiltFiles);
};

exports.buildApi = buildApi;

const cleanApiBuild = () => {
  const rwjsPaths = (0, _paths.getPaths)();
  (0, _fsExtra.removeSync)(rwjsPaths.api.dist);
  (0, _fsExtra.removeSync)(_path.default.join(rwjsPaths.generated.prebuild, 'api'));
};
/**
 * Remove RedwoodJS "magic" from a user's code leaving JavaScript behind.
 */


exports.cleanApiBuild = cleanApiBuild;

const prebuildApiFiles = srcFiles => {
  const rwjsPaths = (0, _paths.getPaths)();
  const plugins = (0, _api.getApiSideBabelPlugins)();
  return (0, _map.default)(srcFiles).call(srcFiles, srcPath => {
    const relativePathFromSrc = _path.default.relative(rwjsPaths.base, srcPath);

    const dstPath = _path.default.join(rwjsPaths.generated.prebuild, relativePathFromSrc).replace(/\.(ts)$/, '.js');

    const result = (0, _api.prebuildApiFile)(srcPath, dstPath, plugins);

    if (!(result !== null && result !== void 0 && result.code)) {
      // TODO: Figure out a better way to return these programatically.
      console.warn('Error:', srcPath, 'could not prebuilt.');
      return undefined;
    }

    _fs.default.mkdirSync(_path.default.dirname(dstPath), {
      recursive: true
    });

    _fs.default.writeFileSync(dstPath, result.code);

    return dstPath;
  });
};

exports.prebuildApiFiles = prebuildApiFiles;

const transpileApi = (files, options = {}) => {
  const rwjsPaths = (0, _paths.getPaths)();
  return esbuild.buildSync({
    absWorkingDir: rwjsPaths.api.base,
    entryPoints: files,
    platform: 'node',
    target: 'node14',
    // Netlify defaults NodeJS 14: https://answers.netlify.com/t/aws-lambda-now-supports-node-js-14/31789/3
    format: 'cjs',
    bundle: false,
    outdir: rwjsPaths.api.dist,
    // setting this to 'true' will generate an external sourcemap x.js.map
    // AND set the sourceMappingURL comment
    // (setting it to 'external' will ONLY generate the file, but won't add the comment)
    sourcemap: true,
    ...options
  });
};

exports.transpileApi = transpileApi;