"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRouterStateSetter = exports.useRouterState = exports.RouterContextProvider = void 0;

var _react = _interopRequireWildcard(require("react"));

var _auth = require("@redwoodjs/auth");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const RouterStateContext = /*#__PURE__*/(0, _react.createContext)(undefined);
const RouterSetContext = /*#__PURE__*/(0, _react.createContext)(undefined);

function stateReducer(state, newState) {
  return { ...state,
    ...newState
  };
}

const RouterContextProvider = _ref => {
  let {
    useAuth: customUseAuth,
    paramTypes,
    children
  } = _ref;
  const [state, setState] = (0, _react.useReducer)(stateReducer, {
    useAuth: customUseAuth || _auth.useAuth,
    paramTypes
  });
  return /*#__PURE__*/_react.default.createElement(RouterStateContext.Provider, {
    value: state
  }, /*#__PURE__*/_react.default.createElement(RouterSetContext.Provider, {
    value: setState
  }, children));
};

exports.RouterContextProvider = RouterContextProvider;

const useRouterState = () => {
  const context = (0, _react.useContext)(RouterStateContext);

  if (context === undefined) {
    throw new Error('useRouterState must be used within a RouterContextProvider');
  }

  return context;
};

exports.useRouterState = useRouterState;

const useRouterStateSetter = () => {
  const context = (0, _react.useContext)(RouterSetContext);

  if (context === undefined) {
    throw new Error('useRouterStateSetter must be used within a RouterContextProvider');
  }

  return context;
};

exports.useRouterStateSetter = useRouterStateSetter;