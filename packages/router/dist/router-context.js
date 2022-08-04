"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.useRouterStateSetter = exports.useRouterState = exports.RouterContextProvider = void 0;

var _react = _interopRequireWildcard(require("react"));

var _auth = require("@redwoodjs/auth");

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