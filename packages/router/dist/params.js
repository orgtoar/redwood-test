"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useParams = exports.ParamsProvider = exports.ParamsContext = void 0;

var _react = _interopRequireWildcard(require("react"));

var _location = require("./location");

var _routerContext = require("./router-context");

var _util = require("./util");

const ParamsContext = (0, _util.createNamedContext)('Params');
exports.ParamsContext = ParamsContext;

const ParamsProvider = _ref => {
  let {
    path,
    location,
    children
  } = _ref;
  const {
    paramTypes
  } = (0, _routerContext.useRouterState)();
  const contextLocation = (0, _location.useLocation)();
  const internalLocation = location || contextLocation;
  let pathParams = {};
  const searchParams = (0, _util.parseSearch)(internalLocation.search);

  if (path) {
    const {
      match,
      params
    } = (0, _util.matchPath)(path, internalLocation.pathname, paramTypes);

    if (match && typeof params !== 'undefined') {
      pathParams = params;
    }
  }

  return /*#__PURE__*/_react.default.createElement(ParamsContext.Provider, {
    value: {
      params: { ...searchParams,
        ...pathParams
      }
    }
  }, children);
};

exports.ParamsProvider = ParamsProvider;

const useParams = () => {
  const paramsContext = (0, _react.useContext)(ParamsContext);

  if (paramsContext === undefined) {
    throw new Error('useParams must be used within a ParamsProvider');
  }

  return paramsContext.params;
};

exports.useParams = useParams;