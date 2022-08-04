"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.advanced_path_parser = advanced_path_parser;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

var _matchAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/match-all"));

/**
 * A route path parser with positional information.
 * Used to enable decorations
 * @param route
 */
function advanced_path_parser(route) {
  const paramRanges = [];
  const paramTypeRanges = [];

  for (const param of (0, _matchAll.default)(route).call(route, /\{([^}]+)\}/g)) {
    const [paramName, paramType] = param[1].split(':');
    const index = param.index + 1;
    paramRanges.push([index, index + paramName.length]);

    if (paramType) {
      const typeIndex = index + paramName.length + 2;
      paramTypeRanges.push([typeIndex, typeIndex + paramType.length]);
    }
  }

  const punctuationIndexes = [...(0, _matchAll.default)(route).call(route, /[{}:]/g)].map(x => x.index);
  const slashIndexes = [...(0, _matchAll.default)(route).call(route, /[\/]/g)].map(x => x.index);
  return {
    punctuationIndexes,
    slashIndexes,
    paramRanges,
    paramTypeRanges
  };
}