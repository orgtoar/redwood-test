"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.advanced_path_parser = advanced_path_parser;

var _matchAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/match-all"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

/**
 * A route path parser with positional information.
 * Used to enable decorations
 * @param route
 */
function advanced_path_parser(route) {
  var _context, _context2;

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

  const punctuationIndexes = (0, _map.default)(_context = [...(0, _matchAll.default)(route).call(route, /[{}:]/g)]).call(_context, x => x.index);
  const slashIndexes = (0, _map.default)(_context2 = [...(0, _matchAll.default)(route).call(route, /[\/]/g)]).call(_context2, x => x.index);
  return {
    punctuationIndexes,
    slashIndexes,
    paramRanges,
    paramTypeRanges
  };
}