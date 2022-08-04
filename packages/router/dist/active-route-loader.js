"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.ActiveRouteLoader = void 0;

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/set-timeout"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _values = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/values"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = require("react-dom");

var _a11yUtils = require("./a11yUtils");

var _ActivePageContext = require("./ActivePageContext");

var _PageLoadingContext = require("./PageLoadingContext");

var _useIsMounted = require("./useIsMounted");

var _ = require(".");

const DEFAULT_PAGE_LOADING_DELAY = 1000; // milliseconds

const ArlNullPage = () => null;

const ArlWhileLoadingNullPage = () => null;

const ActiveRouteLoader = _ref => {
  var _loadingState$rendere, _loadingState$rendere2, _loadingState$path2;

  let {
    path,
    spec,
    delay,
    params,
    whileLoadingPage,
    children
  } = _ref;
  const location = (0, _.useLocation)();
  const [pageName, setPageName] = (0, _react.useState)('');
  const loadingTimeout = (0, _react.useRef)();
  const announcementRef = (0, _react.useRef)(null);
  const waitingFor = (0, _react.useRef)('');
  const [loadingState, setLoadingState] = (0, _react.useState)({
    [path]: {
      page: ArlNullPage,
      specName: '',
      state: 'PRE_SHOW',
      location
    }
  });
  const [renderedChildren, setRenderedChildren] = (0, _react.useState)(children);
  const [renderedPath, setRenderedPath] = (0, _react.useState)(path);
  const isMounted = (0, _useIsMounted.useIsMounted)();

  const clearLoadingTimeout = () => {
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }
  };

  (0, _react.useEffect)(() => {
    var _global;

    (_global = global) === null || _global === void 0 ? void 0 : _global.scrollTo(0, 0);

    if (announcementRef.current) {
      announcementRef.current.innerText = (0, _a11yUtils.getAnnouncement)();
    }

    const routeFocus = (0, _a11yUtils.getFocus)();

    if (!routeFocus) {
      (0, _a11yUtils.resetFocus)();
    } else {
      routeFocus.focus();
    }
  }, [pageName, params]);
  (0, _react.useEffect)(() => {
    const startPageLoadTransition = async function (_ref2) {
      let {
        loader,
        name
      } = _ref2;
      let delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_PAGE_LOADING_DELAY;
      setLoadingState(loadingState => ({ ...loadingState,
        [path]: {
          page: ArlNullPage,
          specName: '',
          state: 'PRE_SHOW',
          location
        }
      })); // Update the context if importing the page is taking longer
      // than `delay`.
      // Consumers of the context can show a loading indicator
      // to signal to the user that something is happening.

      loadingTimeout.current = (0, _setTimeout2.default)(() => {
        (0, _reactDom.unstable_batchedUpdates)(() => {
          setLoadingState(loadingState => ({ ...loadingState,
            [path]: {
              page: whileLoadingPage || ArlWhileLoadingNullPage,
              specName: '',
              state: 'SHOW_LOADING',
              location
            }
          }));
          setRenderedChildren(children);
          setRenderedPath(path);
        });
      }, delay); // Wait to download and parse the page.

      waitingFor.current = name;
      const module = await loader(); // Remove the timeout because the page has loaded.

      clearLoadingTimeout(); // Only update all state if we're still interested (i.e. we're still
      // waiting for the page that just finished loading)

      if (isMounted() && name === waitingFor.current) {
        (0, _reactDom.unstable_batchedUpdates)(() => {
          setLoadingState(loadingState => ({ ...loadingState,
            [path]: {
              page: module.default,
              specName: name,
              state: 'DONE',
              location
            }
          })); // `children` could for example be a Set or a Route. Either way the
          // just-loaded page will be somewhere in the children tree. But
          // children could also be undefined, in which case we'll just render
          // the just-loaded page itself. For example, when we render the
          // NotFoundPage children will be undefined and the default export in
          // `module` will be the NotFoundPage itself.

          setRenderedChildren(children !== null && children !== void 0 ? children : module.default);
          setRenderedPath(path);
          setPageName(name);
        });
      }
    };

    if (spec.name !== waitingFor.current) {
      clearLoadingTimeout();
      startPageLoadTransition(spec, delay);
    } else {
      (0, _reactDom.unstable_batchedUpdates)(() => {
        // Handle navigating to the same page again, but with different path
        // params (i.e. new `location` or route params)
        setLoadingState(loadingState => {
          var _loadingState$path;

          // If path is same, fetch the page again
          let existingPage = (_loadingState$path = loadingState[path]) === null || _loadingState$path === void 0 ? void 0 : _loadingState$path.page; // If path is different, try to find the existing page

          if (!existingPage) {
            var _context;

            const pageState = (0, _find.default)(_context = (0, _values.default)(loadingState)).call(_context, state => (state === null || state === void 0 ? void 0 : state.specName) === spec.name);
            existingPage = pageState === null || pageState === void 0 ? void 0 : pageState.page;
          }

          return { ...loadingState,
            [path]: {
              page: existingPage || ArlNullPage,
              specName: spec.name,
              state: 'DONE',
              location
            }
          };
        });
        setRenderedChildren(children);
        setRenderedPath(path);
      });
    }

    return () => {
      clearLoadingTimeout();
    };
  }, [spec, delay, children, whileLoadingPage, path, location, isMounted]); // It might feel tempting to move this code further up in the file for an
  // "early return", but React doesn't allow that because pretty much all code
  // above is hooks, and they always need to come before any `return`

  if (global.__REDWOOD__PRERENDERING) {
    // babel auto-loader plugin uses withStaticImport in prerender mode
    // override the types for this condition
    const syncPageLoader = spec.loader;
    const PageFromLoader = syncPageLoader().default;
    const prerenderLoadingState = {
      [path]: {
        state: 'DONE',
        specName: spec.name,
        page: PageFromLoader,
        location
      }
    };
    return /*#__PURE__*/_react.default.createElement(_.ParamsProvider, {
      path: path,
      location: location
    }, /*#__PURE__*/_react.default.createElement(_PageLoadingContext.PageLoadingContextProvider, {
      value: {
        loading: false
      }
    }, /*#__PURE__*/_react.default.createElement(_ActivePageContext.ActivePageContextProvider, {
      value: {
        loadingState: prerenderLoadingState
      }
    }, children)));
  }

  return /*#__PURE__*/_react.default.createElement(_.ParamsProvider, {
    path: renderedPath,
    location: (_loadingState$rendere = loadingState[renderedPath]) === null || _loadingState$rendere === void 0 ? void 0 : _loadingState$rendere.location
  }, /*#__PURE__*/_react.default.createElement(_ActivePageContext.ActivePageContextProvider, {
    value: {
      loadingState
    }
  }, /*#__PURE__*/_react.default.createElement(_PageLoadingContext.PageLoadingContextProvider, {
    value: {
      loading: ((_loadingState$rendere2 = loadingState[renderedPath]) === null || _loadingState$rendere2 === void 0 ? void 0 : _loadingState$rendere2.state) === 'SHOW_LOADING'
    }
  }, renderedChildren, ((_loadingState$path2 = loadingState[path]) === null || _loadingState$path2 === void 0 ? void 0 : _loadingState$path2.state) === 'DONE' && /*#__PURE__*/_react.default.createElement("div", {
    id: "redwood-announcer",
    style: {
      position: 'absolute',
      top: 0,
      width: 1,
      height: 1,
      padding: 0,
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0
    },
    role: "alert",
    "aria-live": "assertive",
    "aria-atomic": "true",
    ref: announcementRef
  }))));
};

exports.ActiveRouteLoader = ActiveRouteLoader;