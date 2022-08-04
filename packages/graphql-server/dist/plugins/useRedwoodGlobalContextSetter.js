"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRedwoodGlobalContextSetter = void 0;

var _index = require("../index");

/**
 * This Envelop plugin waits until the GraphQL context is done building and sets the
 * Redwood global context which can be imported with:
 * // import { context } from '@redwoodjs/graphql-server'
 * @returns
 */
const useRedwoodGlobalContextSetter = () => ({
  onContextBuilding() {
    return ({
      context: redwoodGraphqlContext
    }) => {
      (0, _index.setContext)(redwoodGraphqlContext);
    };
  }

});

exports.useRedwoodGlobalContextSetter = useRedwoodGlobalContextSetter;