"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.useIsBrowser = exports.isPrerendering = exports.isBrowser = exports.BrowserOnly = void 0;

var _react = require("react");

/* Web side prerender utils, to be used on the browser */
const isPrerendering = () => {
  return global.__REDWOOD__PRERENDERING ?? false;
};

exports.isPrerendering = isPrerendering;
const isBrowser = !isPrerendering();
exports.isBrowser = isBrowser;

const useIsBrowser = () => {
  return (0, _react.useMemo)(() => {
    return !global?.__REDWOOD__PRERENDERING;
  }, []);
};

exports.useIsBrowser = useIsBrowser;

const BrowserOnly = ({
  children
}) => {
  const isBrowser = useIsBrowser();
  return isBrowser ? children : null;
};

exports.BrowserOnly = BrowserOnly;