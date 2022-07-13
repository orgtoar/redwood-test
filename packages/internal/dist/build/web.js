"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.prebuildWebFiles = exports.cleanWebBuild = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _fsExtra = require("fs-extra");

var _paths = require("../paths");

var _web = require("./babel/web");

// @MARK
// This whole file is currently only used in testing
// we may eventually use this to pretranspile the web side
const cleanWebBuild = () => {
  const rwjsPaths = (0, _paths.getPaths)();
  (0, _fsExtra.removeSync)(rwjsPaths.web.dist);
  (0, _fsExtra.removeSync)(_path.default.join(rwjsPaths.generated.prebuild, 'web'));
};
/**
 * Remove RedwoodJS "magic" from a user's code leaving JavaScript behind.
 */


exports.cleanWebBuild = cleanWebBuild;

const prebuildWebFiles = (srcFiles, flags) => {
  const rwjsPaths = (0, _paths.getPaths)();
  return (0, _map.default)(srcFiles).call(srcFiles, srcPath => {
    const relativePathFromSrc = _path.default.relative(rwjsPaths.base, srcPath);

    const dstPath = _path.default.join(rwjsPaths.generated.prebuild, relativePathFromSrc).replace(/\.(ts)$/, '.js');

    const result = (0, _web.prebuildWebFile)(srcPath, flags);

    if (!(result !== null && result !== void 0 && result.code)) {
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

exports.prebuildWebFiles = prebuildWebFiles;