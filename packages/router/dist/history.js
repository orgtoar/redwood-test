"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.navigate = exports.gHistory = exports.back = void 0;

var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));

var _url = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/url"));

var _values = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/values"));

const createHistory = () => {
  const listeners = {};
  return {
    listen: listener => {
      const listenerId = 'RW_HISTORY_LISTENER_ID_' + (0, _now.default)();
      listeners[listenerId] = listener;
      global.addEventListener('popstate', listener);
      return listenerId;
    },
    navigate: (to, options) => {
      var _global, _global$location, _global2, _global2$location, _global3, _global3$location, _global4, _global4$location;

      const {
        pathname,
        search,
        hash
      } = new _url.default(((_global = global) === null || _global === void 0 ? void 0 : (_global$location = _global.location) === null || _global$location === void 0 ? void 0 : _global$location.origin) + to);

      if (((_global2 = global) === null || _global2 === void 0 ? void 0 : (_global2$location = _global2.location) === null || _global2$location === void 0 ? void 0 : _global2$location.pathname) !== pathname || ((_global3 = global) === null || _global3 === void 0 ? void 0 : (_global3$location = _global3.location) === null || _global3$location === void 0 ? void 0 : _global3$location.search) !== search || ((_global4 = global) === null || _global4 === void 0 ? void 0 : (_global4$location = _global4.location) === null || _global4$location === void 0 ? void 0 : _global4$location.hash) !== hash) {
        if (options !== null && options !== void 0 && options.replace) {
          global.history.replaceState({}, '', to);
        } else {
          global.history.pushState({}, '', to);
        }
      }

      for (const listener of (0, _values.default)(listeners)) {
        listener();
      }
    },
    back: () => {
      global.history.back();

      for (const listener of (0, _values.default)(listeners)) {
        listener();
      }
    },
    remove: listenerId => {
      if (listeners[listenerId]) {
        const listener = listeners[listenerId];
        global.removeEventListener('popstate', listener);
        delete listeners[listenerId];
      } else {
        console.warn('History Listener with ID: ' + listenerId + ' does not exist.');
      }
    }
  };
};

const gHistory = createHistory();
exports.gHistory = gHistory;
const {
  navigate,
  back
} = gHistory;
exports.back = back;
exports.navigate = navigate;