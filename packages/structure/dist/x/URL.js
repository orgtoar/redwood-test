"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.URL_file = URL_file;
exports.URL_toFile = URL_toFile;

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));

var _url = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/url"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _path = require("path");

/**
 * Creates a file:// URL
 * Works with linux and windows paths
 * If the passed in value is already as file:// URL, it returns that same value
 * TOOD: rename to URL_fromFile
 * @param filePath
 */
function URL_file(filePath, ...parts) {
  if ((0, _startsWith.default)(filePath).call(filePath, FILE_SCHEME)) {
    filePath = filePath.substr(FILE_SCHEME.length);
  }

  if (parts.length > 0) {
    filePath = (0, _path.join)(filePath, ...parts);
  }

  return new _url.default(FILE_SCHEME + (0, _path.normalize)(filePath)).href;
}
/**
 *
 * @param uriOrFilePath
 * @param sep separator string, defaults to `require('path').sep`
 */


function URL_toFile(uriOrFilePath, sep = _path.sep) {
  if (typeof uriOrFilePath !== 'string') {
    throw new Error('arg error');
  }

  if ((0, _startsWith.default)(uriOrFilePath).call(uriOrFilePath, FILE_SCHEME)) {
    return fileUriToPath(uriOrFilePath, sep);
  }

  const p = (0, _path.normalize)(uriOrFilePath);

  if (!(0, _path.isAbsolute)(p)) {
    throw new Error('absolute path expected: ' + p);
  }

  return p;
}

const FILE_SCHEME = 'file://';
/**
 * based on https://github.com/TooTallNate/file-uri-to-path/blob/master/src/index.ts
 * main changes:
 * - modified to work with VSCode Language Server URIs (they encode colons: "file:///c%3A/a/b.c" )
 * - you can pass "sep", the system separator, (for tests)
 *
 * @param uri
 * @param sep
 */

function fileUriToPath(uri, sep = _path.sep) {
  var _context;

  if (typeof uri !== 'string' || uri.length <= 7 || uri.substring(0, 7) !== FILE_SCHEME) {
    throw new TypeError('must pass in a file:// URI to convert to a file path');
  }

  const rest = decodeURIComponent(uri.substring(7));
  const firstSlash = (0, _indexOf.default)(rest).call(rest, '/');
  let host = rest.substring(0, firstSlash);
  let path = rest.substring(firstSlash + 1); // 2.  Scheme Definition
  // As a special case, <host> can be the string "localhost" or the empty
  // string; this is interpreted as "the machine from which the URL is
  // being interpreted".

  if (host === 'localhost') {
    host = '';
  }

  if (host) {
    host = sep + sep + host;
  } // 3.2  Drives, drive letters, mount points, file system root
  // Drive letters are mapped into the top of a file URI in various ways,
  // depending on the implementation; some applications substitute
  // vertical bar ("|") for the colon after the drive letter, yielding
  // "file:///c|/tmp/test.txt".  In some cases, the colon is left
  // unchanged, as in "file:///c:/tmp/test.txt".  In other cases, the
  // colon is simply omitted, as in "file:///c/tmp/test.txt".


  path = path.replace(/^(.+)\|/, '$1:');
  const parts = path.split('/'); // if the first segment is NOT a windows drive
  // we insert an extra empty segment
  // this will result in an initial slash (unix style)

  if (!(0, _includes.default)(_context = parts[0]).call(_context, ':')) {
    parts.unshift('');
  }

  return parts.join(sep);
}