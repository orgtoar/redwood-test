"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTSMSourceFile = createTSMSourceFile;
exports.createTSMSourceFile_cached = createTSMSourceFile_cached;

var crypto = _interopRequireWildcard(require("crypto"));

var _lodash = require("lodash");

var _lruCache = _interopRequireDefault(require("lru-cache"));

var tsm = _interopRequireWildcard(require("ts-morph"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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