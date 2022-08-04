"use strict";

var _context;

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _forEachInstanceProperty2 = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

var _exportNames = {
  routes: true,
  Router: true
};
exports.routes = exports.Router = void 0;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _react = _interopRequireDefault(require("react"));

var _router = require("@redwoodjs/router/dist/router");

var _util = require("@redwoodjs/router/dist/util");

var _index = require("@redwoodjs/router/dist/index");

_forEachInstanceProperty2(_context = _Object$keys(_index)).call(_context, function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _index[key]) return;

  _Object$defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index[key];
    }
  });
});

/* eslint-disable @typescript-eslint/ban-ts-comment */
// Bypass the `main` field in `package.json` because we alias `@redwoodjs/router`
// for jest and Storybook. Not doing so would cause an infinite loop.
// See: ./packages/core/config/src/configs/browser/jest.createConfig.ts
// @ts-ignore
// @ts-ignore
const routes = {};
/**
 * We overwrite the default `Router` export.
 * It populates the `routes.<pagename>()` utility object.
 */

exports.routes = routes;

const Router = ({
  children
}) => {
  const flatChildArray = (0, _util.flattenAll)(children);
  (0, _forEach.default)(flatChildArray).call(flatChildArray, child => {
    if ((0, _router.isRoute)(child)) {
      const {
        name,
        path
      } = child.props;

      if (name && path) {
        routes[name] = (args = {}) => (0, _util.replaceParams)(path, args);
      }
    }
  });
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
};

exports.Router = Router;