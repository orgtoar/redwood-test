"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertToDataUrl = convertToDataUrl;

var _fs = _interopRequireDefault(require("fs"));

var _mimeTypes = _interopRequireDefault(require("mime-types"));

// These functions are in a seprate file so that they can be mocked with jest
// Its possible for sourceRoot to be undefined in the tests..
// Not sure if possible in actually running builds
function convertToDataUrl(assetPath) {
  try {
    const base64AssetContents = _fs.default.readFileSync(assetPath, 'base64');

    const mimeType = _mimeTypes.default.lookup(assetPath);

    return `data:${mimeType};base64,${base64AssetContents}`;
  } catch (e) {
    console.warn(`Could not read file ${assetPath} for conversion to data uri`);
    return '';
  }
}