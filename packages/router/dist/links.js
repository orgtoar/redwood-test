"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.useMatch = exports.Redirect = exports.NavLink = exports.Link = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/extends"));

var _urlSearchParams = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/url-search-params"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _react = _interopRequireWildcard(require("react"));

var _history = require("./history");

var _location = require("./location");

var _util = require("./util");

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
    var _context;

    const locationParams = new _urlSearchParams.default(location.search);
    const hasUnmatched = (0, _some.default)(_context = options.searchParams).call(_context, param => {
      if (typeof param === 'string') {
        return !locationParams.has(param);
      } else {
        var _context2;

        return (0, _some.default)(_context2 = (0, _keys.default)(param)).call(_context2, key => param[key] != locationParams.get(key));
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
  var _context3;

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
  const theClassName = (0, _filter.default)(_context3 = [className, matchInfo.match && activeClassName]).call(_context3, Boolean).join(' ');
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