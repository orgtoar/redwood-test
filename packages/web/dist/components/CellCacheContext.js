"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.CellCacheContextProvider = void 0;
exports.useCellCacheContext = useCellCacheContext;

var _react = _interopRequireWildcard(require("react"));

const CellCacheContext = /*#__PURE__*/(0, _react.createContext)(undefined);

const CellCacheContextProvider = _ref => {
  let {
    queryCache,
    children
  } = _ref;
  return /*#__PURE__*/_react.default.createElement(CellCacheContext.Provider, {
    value: {
      queryCache
    }
  }, children);
};

exports.CellCacheContextProvider = CellCacheContextProvider;

function useCellCacheContext() {
  const context = (0, _react.useContext)(CellCacheContext);

  if (!context) {
    throw new Error('useCellCacheContext must be used within a CellCacheContextProvider');
  }

  return context;
}