"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useMatch = exports.Redirect = exports.NavLink = exports.Link = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _history = require("./history");

var _location = require("./location");

var _util = require("./util");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Returns true if the given pathname matches the current location.pathname,
 * provide searchParams options to match the current location.search
 *
 * This is useful for components that need to know "active" state, e.g.
 * <NavLink>.
 *
 * Examples:
 *
 * Match search params key existence
 * const match = useMatch('/about', ['category', 'page'])
 *
 * Match search params key and value
 * const match = useMatch('/items', [{page: 2}, {category: 'book'}])
 *
 * Mix match
 * const match = useMatch('/list', [{page: 2}, 'gtm'])
 *
 */
const useMatch = (pathname, options) => {
  const location = (0, _location.useLocation)();

  if (!location) {
    return {
      match: false
    };
  }

  if (options !== null && options !== void 0 && options.searchParams) {
    const locationParams = new URLSearchParams(location.search);
    const hasUnmatched = options.searchParams.some(param => {
      if (typeof param === 'string') {
        return !locationParams.has(param);
      } else {
        return Object.keys(param).some(key => param[key] != locationParams.get(key));
      }
    });

    if (hasUnmatched) {
      return {
        match: false
      };
    }
  }

  return (0, _util.matchPath)(pathname, location.pathname);
};

exports.useMatch = useMatch;
const Link = /*#__PURE__*/(0, _react.forwardRef)((_ref, ref) => {
  let {
    to,
    onClick,
    ...rest
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("a", (0, _extends2.default)({
    href: to,
    ref: ref
  }, rest, {
    onClick: event => {
      if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      event.preventDefault();

      if (onClick) {
        const result = onClick(event);

        if (typeof result !== 'boolean' || result) {
          (0, _history.navigate)(to);
        }
      } else {
        (0, _history.navigate)(to);
      }
    }
  }));
});
exports.Link = Link;
const NavLink = /*#__PURE__*/(0, _react.forwardRef)((_ref2, ref) => {
  let {
    to,
    activeClassName,
    activeMatchParams,
    className,
    onClick,
    ...rest
  } = _ref2;
  // Separate pathname and search parameters, USVString expected
  const [pathname, queryString] = to.split('?');
  const searchParams = activeMatchParams || (0, _util.flattenSearchParams)(queryString);
  const matchInfo = useMatch(pathname, {
    searchParams
  });
  const theClassName = [className, matchInfo.match && activeClassName].filter(Boolean).join(' ');
  return /*#__PURE__*/_react.default.createElement("a", (0, _extends2.default)({
    href: to,
    ref: ref,
    className: theClassName
  }, rest, {
    onClick: event => {
      if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      event.preventDefault();

      if (onClick) {
        const result = onClick(event);

        if (typeof result !== 'boolean' || result) {
          (0, _history.navigate)(to);
        }
      } else {
        (0, _history.navigate)(to);
      }
    }
  }));
});
exports.NavLink = NavLink;

/**
 * A declarative way to redirect to a route name
 */
const Redirect = _ref3 => {
  let {
    to,
    options
  } = _ref3;
  (0, _react.useEffect)(() => (0, _history.navigate)(to, options), [to, options]);
  return null;
};

exports.Redirect = Redirect;