"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useActivePageContext = exports.ActivePageContextProvider = void 0;

var _react = require("react");

var _util = require("./util");

const ActivePageContext = (0, _util.createNamedContext)('ActivePage');
const ActivePageContextProvider = ActivePageContext.Provider;
exports.ActivePageContextProvider = ActivePageContextProvider;

const useActivePageContext = () => {
  const activePageContext = (0, _react.useContext)(ActivePageContext);

  if (!activePageContext) {
    throw new Error('useActivePageContext must be used within a ActivePageContext provider');
  }

  return activePageContext;
};

exports.useActivePageContext = useActivePageContext;