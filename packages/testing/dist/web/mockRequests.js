"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.startMSW = exports.setupRequestHandlers = exports.registerHandler = exports.mockedUserMeta = exports.mockGraphQLQuery = exports.mockGraphQLMutation = exports.mockCurrentUser = void 0;

var _msw = require("msw");

// MSW is shared by Jest (NodeJS) and Storybook (Webpack)
// Allow users to call "mockGraphQLQuery" and "mockGraphQLMutation"
// before the server has started. We store the request handlers in
// a queue that is drained once the server is started.
let REQUEST_HANDLER_QUEUE = [];
let SERVER_INSTANCE;
/**
 * Plugs fetch for the correct target in order to capture requests.
 *
 * Request handlers can be registered lazily (via `mockGraphQL<Query|Mutation>`),
 * the queue will be drained and used.
 */

const startMSW = async (target, options) => {
  if (SERVER_INSTANCE) {
    return SERVER_INSTANCE;
  }

  if (target === 'browsers') {
    SERVER_INSTANCE = (0, _msw.setupWorker)();
    await SERVER_INSTANCE.start(options);
  } else {
    const {
      setupServer
    } = require('msw/node');

    SERVER_INSTANCE = setupServer();
    await SERVER_INSTANCE.listen(options);
  }

  return SERVER_INSTANCE;
};

exports.startMSW = startMSW;

const setupRequestHandlers = () => {
  SERVER_INSTANCE.resetHandlers(); // Register all the handlers that are stored in the queue.

  for (const handler of REQUEST_HANDLER_QUEUE) {
    SERVER_INSTANCE.use(handler);
  }
};

exports.setupRequestHandlers = setupRequestHandlers;

const registerHandler = handler => {
  if (!SERVER_INSTANCE) {
    // The server hasn't started yet, so add the request handler to the queue.
    // The queue will be drained once the server has started.
    REQUEST_HANDLER_QUEUE = [...REQUEST_HANDLER_QUEUE, handler];
  } else {
    SERVER_INSTANCE.use(handler);
  }
};

exports.registerHandler = registerHandler;

const mockGraphQL = (type, operation, data, responseEnhancer) => {
  const resolver = (req, res, ctx) => {
    let d = data;
    let responseTransforms = [];

    if (typeof data === 'function') {
      // We wrap the original context return values and store them `ctxForResponse`,
      // so that we can provide them to the final `res()` call at the end of this
      // function.
      const captureTransform = fn => {
        return (...args) => {
          const resTransform = fn(...args);
          responseTransforms = [...responseTransforms, resTransform];
          return resTransform;
        };
      };

      const newCtx = {
        status: captureTransform(ctx.status),
        delay: captureTransform(ctx.delay),
        errors: captureTransform(ctx.errors),
        set: captureTransform(ctx.set),
        fetch: captureTransform(ctx.fetch),
        data: captureTransform(ctx.data),
        extensions: captureTransform(ctx.extensions),
        cookie: captureTransform(ctx.cookie)
      };
      d = data(req.variables, {
        req,
        ctx: newCtx
      });
    }

    return (responseEnhancer ? res[responseEnhancer] : res)(ctx.data(d), ...responseTransforms);
  }; // eslint-disable-next-line @typescript-eslint/ban-ts-comment


  registerHandler(_msw.graphql[type](operation, resolver));
  return data;
};

const mockGraphQLQuery = (operation, data, responseEnhancer) => {
  return mockGraphQL('query', operation, data, responseEnhancer);
};

exports.mockGraphQLQuery = mockGraphQLQuery;

const mockGraphQLMutation = (operation, data, responseEnhancer) => {
  return mockGraphQL('mutation', operation, data, responseEnhancer);
};

exports.mockGraphQLMutation = mockGraphQLMutation;
const mockedUserMeta = {
  currentUser: null
};
exports.mockedUserMeta = mockedUserMeta;

const mockCurrentUser = user => {
  mockedUserMeta.currentUser = user;
  mockGraphQLQuery('__REDWOOD__AUTH_GET_CURRENT_USER', () => {
    return {
      redwood: {
        currentUser: user
      }
    };
  });
};

exports.mockCurrentUser = mockCurrentUser;