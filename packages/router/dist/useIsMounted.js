"use strict";

Object.defineProperty(exports, "__esModule", {
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