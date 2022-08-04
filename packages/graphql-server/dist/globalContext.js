"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.shouldUseLocalStorageContext = exports.setContext = exports.getAsyncStoreInstance = exports.createContextProxy = exports.context = void 0;

var _async_hooks = require("async_hooks");

/* eslint-disable react-hooks/rules-of-hooks */
// AWS Lambda run each request in a new process,
// a process is not reused until a request is completed.
//
// Which means that each `global.context` is scoped to the lifetime of each request.
// This makes it safe to use the global context for Redwood Functions.
// However when not in AWS Lambda, NodeJS is single-threaded, you must use the
// per-request global context, otherwise you risk a race-condition
// where one request overwrites another's global context.
//
// Alternatively only use the local `context` in a graphql resolver.
let GLOBAL_CONTEXT = {};
let PER_REQUEST_CONTEXT;

const shouldUseLocalStorageContext = () => process.env.DISABLE_CONTEXT_ISOLATION !== '1';
/**
 * This returns a AsyncLocalStorage instance, not the actual store
 */


exports.shouldUseLocalStorageContext = shouldUseLocalStorageContext;

const getAsyncStoreInstance = () => {
  if (!PER_REQUEST_CONTEXT) {
    PER_REQUEST_CONTEXT = new _async_hooks.AsyncLocalStorage();
  }

  return PER_REQUEST_CONTEXT;
};

exports.getAsyncStoreInstance = getAsyncStoreInstance;

const createContextProxy = () => {
  if (shouldUseLocalStorageContext()) {
    return new Proxy(GLOBAL_CONTEXT, {
      get: (_target, property) => {
        const store = getAsyncStoreInstance().getStore();
        const ctx = (store === null || store === void 0 ? void 0 : store.get('context')) || {};
        return ctx[property];
      },
      set: (_target, property, newVal) => {
        const store = getAsyncStoreInstance().getStore();
        const ctx = (store === null || store === void 0 ? void 0 : store.get('context')) || {};
        ctx[property] = newVal;
        store === null || store === void 0 ? void 0 : store.set('context', ctx);
        return true;
      }
    });
  } else {
    return GLOBAL_CONTEXT;
  }
};

exports.createContextProxy = createContextProxy;
let context = createContextProxy();
/**
 * Set the contents of the global context object.
 */

exports.context = context;

const setContext = newContext => {
  GLOBAL_CONTEXT = newContext;

  if (shouldUseLocalStorageContext()) {
    // re-init the proxy against GLOBAL_CONTEXT,
    // so things like `console.log(context)` is the actual object,
    // not one initialized earlier.
    exports.context = context = createContextProxy();
    const store = getAsyncStoreInstance().getStore();
    store === null || store === void 0 ? void 0 : store.set('context', GLOBAL_CONTEXT);
  } else {
    exports.context = context = GLOBAL_CONTEXT;
  }

  return context;
};

exports.setContext = setContext;