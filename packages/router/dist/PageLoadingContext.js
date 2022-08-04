"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePageLoadingContext = exports.PageLoadingContextProvider = void 0;

var _react = require("react");

var _util = require("./util");

const PageLoadingContext = (0, _util.createNamedContext)('PageLoading');
const PageLoadingContextProvider = PageLoadingContext.Provider;
exports.PageLoadingContextProvider = PageLoadingContextProvider;

const usePageLoadingContext = () => {
  const pageLoadingContext = (0, _react.useContext)(PageLoadingContext);

  if (!pageLoadingContext) {
    throw new Error('usePageLoadingContext must be used within a PageLoadingContext provider');
  }

  return pageLoadingContext;
};

exports.usePageLoadingContext = usePageLoadingContext;