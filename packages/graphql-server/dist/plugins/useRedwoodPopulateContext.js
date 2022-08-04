"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRedwoodPopulateContext = void 0;

/**
 * This Envelop plugin enriches the context on a per-request basis
 * by populating it with the results of a custom function
 * @returns
 */
const useRedwoodPopulateContext = populateContextBuilder => {
  return {
    async onContextBuilding({
      context,
      extendContext
    }) {
      const populateContext = typeof populateContextBuilder === 'function' ? await populateContextBuilder({
        context
      }) : populateContextBuilder;
      extendContext(populateContext);
    }

  };
};

exports.useRedwoodPopulateContext = useRedwoodPopulateContext;