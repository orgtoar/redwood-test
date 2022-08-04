"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useIsBrowser = exports.isPrerendering = exports.isBrowser = exports.BrowserOnly = void 0;

var _react = require("react");

/* Web side prerender utils, to be used on the browser */
const isPrerendering = () => {
  var _global$__REDWOOD__PR;

  return (_global$__REDWOOD__PR = global.__REDWOOD__PRERENDERING) !== null && _global$__REDWOOD__PR !== void 0 ? _global$__REDWOOD__PR : false;
};

exports.isPrerendering = isPrerendering;
const isBrowser = !isPrerendering();
exports.isBrowser = isBrowser;

const useIsBrowser = () => {
  return (0, _react.useMemo)(() => {
    var _global;

    return !((_global = global) !== null && _global !== void 0 && _global.__REDWOOD__PRERENDERING);
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