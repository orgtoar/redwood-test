"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useLocation = exports.LocationProvider = exports.LocationContext = void 0;

var _react = _interopRequireDefault(require("react"));

var _history = require("./history");

var _util = require("./util");

const LocationContext = (0, _util.createNamedContext)('Location');
exports.LocationContext = LocationContext;

class LocationProvider extends _react.default.Component {
  constructor() {
    super(...arguments);
    this.HISTORY_LISTENER_ID = undefined;
    this.state = {
      context: this.getContext()
    };
  }

  getContext() {
    let windowLocation;

    if (typeof window !== 'undefined') {
      const {
        pathname
      } = window.location; // Since we have to update the URL, we might as well handle the trailing
      // slash here, before matching.
      //
      // - never -> strip trailing slashes ("/about/" -> "/about")
      // - always -> add trailing slashes ("/about" -> "/about/")
      // - preserve -> do nothing ("/about" -> "/about", "/about/" -> "/about/")
      //

      switch (this.props.trailingSlashes) {
        case 'never':
          if (pathname.endsWith('/')) {
            window.history.replaceState({}, '', pathname.substr(0, pathname.length - 1));
          }

          break;

        case 'always':
          if (!pathname.endsWith('/')) {
            window.history.replaceState({}, '', pathname + '/');
          }

          break;

        default:
          break;
      }

      windowLocation = window.location;
    } else {
      var _this$context, _this$context2, _this$context3;

      windowLocation = {
        pathname: ((_this$context = this.context) === null || _this$context === void 0 ? void 0 : _this$context.pathname) || '',
        search: ((_this$context2 = this.context) === null || _this$context2 === void 0 ? void 0 : _this$context2.search) || '',
        hash: ((_this$context3 = this.context) === null || _this$context3 === void 0 ? void 0 : _this$context3.hash) || ''
      };
    }

    const {
      pathname,
      search,
      hash
    } = this.props.location || windowLocation;
    return {
      pathname,
      search,
      hash
    };
  }

  componentDidMount() {
    this.HISTORY_LISTENER_ID = _history.gHistory.listen(() => {
      this.setState(() => ({
        context: this.getContext()
      }));
    });
  }

  componentWillUnmount() {
    if (this.HISTORY_LISTENER_ID) {
      _history.gHistory.remove(this.HISTORY_LISTENER_ID);
    }
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(LocationContext.Provider, {
      value: this.state.context
    }, this.props.children);
  }

}

exports.LocationProvider = LocationProvider;
LocationProvider.contextType = LocationContext;

const useLocation = () => {
  const location = _react.default.useContext(LocationContext);

  if (location === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }

  return location;
};

exports.useLocation = useLocation;