"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useParams = exports.ParamsProvider = exports.ParamsContext = void 0;

var _react = _interopRequireWildcard(require("react"));

var _location = require("./location");

var _routerContext = require("./router-context");

var _util = require("./util");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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