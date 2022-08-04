"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.Private = Private;
exports.Set = Set;

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/extends"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/is-array"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _reduceRight = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce-right"));

var _react = _interopRequireWildcard(require("react"));

var _links = require("./links");

var _router = require("./router");

var _routerContext = require("./router-context");

const IdentityWrapper = _ref => {
  let {
    children
  } = _ref;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, children);
};

function Set(props) {
  const {
    wrap,
    children,
    private: privateSet,
    unauthenticated,
    roles,
    whileLoadingAuth,
    ...rest
  } = props;
  const routerState = (0, _routerContext.useRouterState)();
  const {
    loading,
    isAuthenticated,
    hasRole
  } = routerState.useAuth();

  if (privateSet && !unauthenticated) {
    throw new Error('Private Sets need to specify what route to redirect unauthorized users to by setting the `unauthenticated` prop');
  }

  const unauthorized = (0, _react.useCallback)(() => {
    return !(isAuthenticated && (!roles || hasRole(roles)));
  }, [isAuthenticated, roles, hasRole]); // Make sure `wrappers` is always an array with at least one wrapper component

  const wrappers = (0, _isArray.default)(wrap) ? wrap : [wrap ? wrap : IdentityWrapper];

  if (privateSet && unauthorized()) {
    if (loading) {
      return (whileLoadingAuth === null || whileLoadingAuth === void 0 ? void 0 : whileLoadingAuth()) || null;
    } else {
      var _context;

      const currentLocation = global.location.pathname + encodeURIComponent(global.location.search); // We already have a check for !unauthenticated further up

      const unauthenticatedPath = _router.routes[unauthenticated || '']();

      if (!unauthenticatedPath) {
        throw new Error("We could not find a route named ".concat(unauthenticated));
      }

      return /*#__PURE__*/_react.default.createElement(_links.Redirect, {
        to: (0, _concat.default)(_context = "".concat(unauthenticatedPath, "?redirectTo=")).call(_context, currentLocation)
      });
    }
  } // Expand and nest the wrapped elements.


  return (0, _reduceRight.default)(wrappers).call(wrappers, (acc, wrapper) => {
    return /*#__PURE__*/_react.default.createElement(wrapper, { ...rest,
      children: acc ? acc : children
    });
  }, undefined) || null;
}

function Private(props) {
  const {
    children,
    unauthenticated,
    roles,
    wrap,
    ...rest
  } = props;
  return (
    /*#__PURE__*/
    // @MARK Doesn't matter that we pass `any` here
    // Because user's still get a typed Private component
    // If we leave `<any>` out, TS will infer the generic argument to be
    // `WrapperProps`, which looks more correct, but it will cause a type
    // error I'm not sure how to solve
    _react.default.createElement(Set, (0, _extends2.default)({
      private: true,
      unauthenticated: unauthenticated,
      roles: roles,
      wrap: wrap
    }, rest), children)
  );
}