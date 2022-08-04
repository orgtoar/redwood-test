"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRedwoodAuthContext = void 0;

var _api = require("@redwoodjs/api");

/**
 * Envelop plugin for injecting the current user into the GraphQL Context,
 * based on custom getCurrentUser function.
 */
const useRedwoodAuthContext = getCurrentUser => {
  return {
    async onContextBuilding({
      context,
      extendContext
    }) {
      const {
        requestContext
      } = context;
      let authContext = undefined;

      try {
        authContext = await (0, _api.getAuthenticationContext)({
          event: context.event,
          context: requestContext
        });
      } catch (error) {
        throw new Error(`Exception in getAuthenticationContext: ${error.message}`);
      }

      try {
        if (authContext) {
          const currentUser = getCurrentUser ? await getCurrentUser(authContext[0], authContext[1], authContext[2]) : null;
          extendContext({
            currentUser
          });
        }
      } catch (error) {
        throw new Error(`Exception in getCurrentUser: ${error.message}`);
      }
    }

  };
};

exports.useRedwoodAuthContext = useRedwoodAuthContext;