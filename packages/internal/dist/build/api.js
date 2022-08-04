"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transpileApi = exports.prebuildApiFiles = exports.cleanApiBuild = exports.buildApi = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var esbuild = _interopRequireWildcard(require("esbuild"));

var _fsExtra = require("fs-extra");

var _files = require("../files");

var _paths = require("../paths");

var _api = require("./babel/api");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const buildApi = () => {
  // TODO: Be smarter about caching and invalidating files,
  // but right now we just delete everything.
  cleanApiBuild();
  const srcFiles = (0, _files.findApiFiles)();
  const prebuiltFiles = prebuildApiFiles(srcFiles).filter(path => path !== undefined);
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
  return srcFiles.map(srcPath => {
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
    target: 'node12',
    // Netlify defaults NodeJS 12: https://answers.netlify.com/t/aws-lambda-now-supports-node-js-14/31789/3
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