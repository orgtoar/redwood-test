"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Private = Private;
exports.Set = Set;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _links = require("./links");

var _router = require("./router");

var _routerContext = require("./router-context");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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

  const wrappers = Array.isArray(wrap) ? wrap : [wrap ? wrap : IdentityWrapper];

  if (privateSet && unauthorized()) {
    if (loading) {
      return (whileLoadingAuth === null || whileLoadingAuth === void 0 ? void 0 : whileLoadingAuth()) || null;
    } else {
      const currentLocation = global.location.pathname + encodeURIComponent(global.location.search); // We already have a check for !unauthenticated further up

      const unauthenticatedPath = _router.routes[unauthenticated || '']();

      if (!unauthenticatedPath) {
        throw new Error("We could not find a route named ".concat(unauthenticated));
      }

      return /*#__PURE__*/_react.default.createElement(_links.Redirect, {
        to: "".concat(unauthenticatedPath, "?redirectTo=").concat(currentLocation)
      });
    }
  } // Expand and nest the wrapped elements.


  return wrappers.reduceRight((acc, wrapper) => {
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