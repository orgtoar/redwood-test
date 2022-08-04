"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * configure Jest to gracefully handle asset files such as stylesheets and images.
 * Usually, these files aren't particularly useful in tests so we can safely mock them out.
 * https://jestjs.io/docs/en/webpack#handling-static-assets
 */
var _default = 'fileMock';
exports.default = _default;