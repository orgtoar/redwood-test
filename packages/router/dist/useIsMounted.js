"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.useIsMounted = void 0;

var _react = require("react");

const useIsMounted = () => {
  const isMounted = (0, _react.useRef)(true);
  (0, _react.useEffect)(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  return (0, _react.useCallback)(() => isMounted.current, []);
};

exports.useIsMounted = useIsMounted;