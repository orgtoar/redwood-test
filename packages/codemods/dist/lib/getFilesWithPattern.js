"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ripgrep = require("@vscode/ripgrep");

var _execa = _interopRequireDefault(require("execa"));

/**
 * Uses ripgrep to search files for a pattern,
 * returning the name of the files that contain the pattern.
 *
 * @see {@link https://github.com/burntsushi/ripgrep}
 */
const getFilesWithPattern = ({
  pattern,
  filesToSearch
}) => {
  try {
    const {
      stdout
    } = _execa.default.sync(_ripgrep.rgPath, ['--files-with-matches', pattern, ...filesToSearch]);
    /**
     * Return an array of files that contain the pattern
     */


    return stdout.toString().split('\n');
  } catch (e) {
    return [];
  }
};

var _default = getFilesWithPattern;
exports.default = _default;