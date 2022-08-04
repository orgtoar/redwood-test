"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CellCacheContextProvider = void 0;
exports.useCellCacheContext = useCellCacheContext;

var _react = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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