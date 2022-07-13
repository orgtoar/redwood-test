"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.RedwoodCommandString = void 0;

var _endsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/ends-with"));

var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var _yargsParser = _interopRequireDefault(require("yargs-parser"));

var _decorators = require("../x/decorators");

var _dec, _dec2, _class;

/**
 * A value class wrapping a Redwood command string.
 * - perform basic validation on construction
 * - used throughout the package to representa a command (instead of using 'string')
 */
let RedwoodCommandString = (_dec = (0, _decorators.lazy)(), _dec2 = (0, _decorators.lazy)(), (_class = class RedwoodCommandString {
  /**
   * this is what we can pass down to the actual CLI
   * it doesn't include "yarn redwood"
   * ex: "generate page Foo /foo"
   */
  constructor(original) {
    var _context, _context2;

    this.original = original;
    this.isComplete = true;
    this.processed = void 0;
    let v = original;

    if (typeof v !== 'string') {
      throw new Error('redwood command must be a string');
    }

    if ((0, _endsWith.default)(_context = (0, _trim.default)(v).call(v)).call(_context, '...')) {
      this.isComplete = false;
      const pp = v.split('...');
      pp.pop();
      v = pp.join('');
    }

    const parts = (0, _map.default)(_context2 = (0, _trim.default)(v).call(v).split(' ')).call(_context2, s => (0, _trim.default)(s).call(s));

    if (parts[0] === 'yarn') {
      parts.shift();
    }

    if (parts[0] === 'redwood' || parts[0] === 'rw') {
      parts.shift();
    }

    this.processed = parts.join(' ');
  }

  get parsed() {
    return (0, _yargsParser.default)(this.processed);
  }

  get isInterceptable() {
    let [a, b] = this.parsed._;

    if (a === 'g') {
      a = 'generate';
    }

    if (a !== 'generate') {
      return false;
    }

    if (b === 'sdl') {
      return false;
    } // <-- why?


    if (b === 'scaffold') {
      return false;
    } // <-- why?


    return true;
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "parsed", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "parsed"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "isInterceptable", [_dec2], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "isInterceptable"), _class.prototype)), _class));
exports.RedwoodCommandString = RedwoodCommandString;