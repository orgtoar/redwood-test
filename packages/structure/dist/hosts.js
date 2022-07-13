"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.DefaultHost = void 0;

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/get-own-property-descriptor"));

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/applyDecoratedDescriptor"));

var fs = _interopRequireWildcard(require("fs-extra"));

var _glob = _interopRequireDefault(require("glob"));

var _internal = require("@redwoodjs/internal");

var _decorators = require("./x/decorators");

var _dec, _class;

let DefaultHost = (_dec = (0, _decorators.lazy)(), (_class = class DefaultHost {
  existsSync(path) {
    return fs.existsSync(path);
  }

  readFileSync(path) {
    return fs.readFileSync(path, {
      encoding: 'utf8'
    }).toString();
  }

  readdirSync(path) {
    return fs.readdirSync(path);
  }

  globSync(pattern) {
    return _glob.default.sync(pattern);
  }

  writeFileSync(path, contents) {
    return fs.writeFileSync(path, contents);
  }

  get paths() {
    return (0, _internal.getPaths)();
  }

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "paths", [_dec], (0, _getOwnPropertyDescriptor.default)(_class.prototype, "paths"), _class.prototype)), _class));
exports.DefaultHost = DefaultHost;