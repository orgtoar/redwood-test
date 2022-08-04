"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRequireAuth = void 0;

require("core-js/modules/esnext.map.delete-all.js");

require("core-js/modules/esnext.map.emplace.js");

require("core-js/modules/esnext.map.every.js");

require("core-js/modules/esnext.map.filter.js");

require("core-js/modules/esnext.map.find.js");

require("core-js/modules/esnext.map.find-key.js");

require("core-js/modules/esnext.map.includes.js");

require("core-js/modules/esnext.map.key-of.js");

require("core-js/modules/esnext.map.map-keys.js");

require("core-js/modules/esnext.map.map-values.js");

require("core-js/modules/esnext.map.merge.js");

require("core-js/modules/esnext.map.reduce.js");

require("core-js/modules/esnext.map.some.js");

require("core-js/modules/esnext.map.update.js");

var _api = require("@redwoodjs/api");

var _globalContext = require("../globalContext");

const useRequireAuth = ({
  handlerFn,
  getCurrentUser
}) => {
  return async (event, context, ...rest) => {
    const authEnrichedFunction = async () => {
      try {
        const authContext = await (0, _api.getAuthenticationContext)({
          event,
          context
        });

        if (authContext) {
          const currentUser = getCurrentUser ? await getCurrentUser(authContext[0], authContext[1], authContext[2]) : null;
          _globalContext.context.currentUser = currentUser;
        }
      } catch (e) {
        _globalContext.context.currentUser = null;

        if (process.env.NODE_ENV === 'development') {
          console.warn('This warning is only printed in development mode.');
          console.warn("Always make sure to have `requireAuth('role')` inside your own handler function.");
          console.warn('');
          console.warn(e);
        }
      }

      return await handlerFn(event, context, ...rest);
    };

    if ((0, _globalContext.getAsyncStoreInstance)()) {
      // This must be used when you're self-hosting RedwoodJS.
      return (0, _globalContext.getAsyncStoreInstance)().run(new Map(), authEnrichedFunction);
    } else {
      // This is OK for AWS (Netlify/Vercel) because each Lambda request
      // is handled individually.
      return await authEnrichedFunction();
    }
  };
};

exports.useRequireAuth = useRequireAuth;