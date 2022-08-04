"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateScaffoldStyles = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

const updateScaffoldStyles = () => {
  const scaffoldCSSPath = _path.default.join((0, _getRWPaths.default)().web.src, 'scaffold.css');

  if (_fs.default.existsSync(scaffoldCSSPath)) {
    let scaffoldCSS = _fs.default.readFileSync(scaffoldCSSPath, 'utf8');

    scaffoldCSS = scaffoldCSS + ['', '.rw-input-error:focus {', '  outline: none;', '  border-color: #c53030;', '  box-shadow: 0 0 5px #c53030;', '}', ''].join('\n');

    _fs.default.writeFileSync(scaffoldCSSPath, scaffoldCSS);
  }
};

exports.updateScaffoldStyles = updateScaffoldStyles;