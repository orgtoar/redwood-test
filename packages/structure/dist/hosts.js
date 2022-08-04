"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultHost = void 0;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var fs = _interopRequireWildcard(require("fs-extra"));

var _glob = _interopRequireDefault(require("glob"));

var _internal = require("@redwoodjs/internal");

var _decorators = require("./x/decorators");

var _dec, _class;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

}, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "paths", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "paths"), _class.prototype)), _class));
exports.DefaultHost = DefaultHost;