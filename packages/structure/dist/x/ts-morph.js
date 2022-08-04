"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.createTSMSourceFile = createTSMSourceFile;
exports.createTSMSourceFile_cached = createTSMSourceFile_cached;

var crypto = _interopRequireWildcard(require("crypto"));

var _lodash = require("lodash");

var _lruCache = _interopRequireDefault(require("lru-cache"));

var tsm = _interopRequireWildcard(require("ts-morph"));

/**
 * Creates a cheap in-memory ts-morph source file
 * @param a1
 * @param a2
 */
function createTSMSourceFile(a1, a2) {
  let [filePath, src] = [a1, a2];

  if (!a2) {
    src = filePath;
    filePath = '/file.tsx';
  }

  return new tsm.Project({
    useInMemoryFileSystem: true,
    skipLoadingLibFiles: true,
    compilerOptions: {
      skipLibCheck: true,
      noLib: true,
      skipDefaultLibCheck: true,
      noResolve: true
    }
  }).createSourceFile(filePath, src);
}

const getCache = (0, _lodash.memoize)(() => new _lruCache.default(200));
/**
 * warning: do NOT modify this file. treat it as immutable
 * @param filePath
 * @param text
 */

function createTSMSourceFile_cached(filePath, text) {
  const key = filePath + '\n' + text;
  const cache = getCache();
  const key2 = crypto.createHash('sha1').update(key).digest('base64');

  if (cache.has(key2)) {
    return cache.get(key2);
  } else {
    const sf = createTSMSourceFile(filePath, text);
    cache.set(key2, sf);
    return sf;
  }
}