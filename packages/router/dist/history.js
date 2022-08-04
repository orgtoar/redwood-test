"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.navigate = exports.gHistory = exports.back = void 0;

const createHistory = () => {
  const listeners = {};
  return {
    listen: listener => {
      const listenerId = 'RW_HISTORY_LISTENER_ID_' + Date.now();
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
      } = new URL(((_global = global) === null || _global === void 0 ? void 0 : (_global$location = _global.location) === null || _global$location === void 0 ? void 0 : _global$location.origin) + to);

      if (((_global2 = global) === null || _global2 === void 0 ? void 0 : (_global2$location = _global2.location) === null || _global2$location === void 0 ? void 0 : _global2$location.pathname) !== pathname || ((_global3 = global) === null || _global3 === void 0 ? void 0 : (_global3$location = _global3.location) === null || _global3$location === void 0 ? void 0 : _global3$location.search) !== search || ((_global4 = global) === null || _global4 === void 0 ? void 0 : (_global4$location = _global4.location) === null || _global4$location === void 0 ? void 0 : _global4$location.hash) !== hash) {
        if (options !== null && options !== void 0 && options.replace) {
          global.history.replaceState({}, '', to);
        } else {
          global.history.pushState({}, '', to);
        }
      }

      for (const listener of Object.values(listeners)) {
        listener();
      }
    },
    back: () => {
      global.history.back();

      for (const listener of Object.values(listeners)) {
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