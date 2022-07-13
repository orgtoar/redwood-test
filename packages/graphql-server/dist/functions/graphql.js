"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.formatError = exports.createGraphQLHandler = void 0;

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _url = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/url"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/is-array"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _map2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/map"));

var _common = require("@graphql-yoga/common");

var _depthLimit = require("@envelop/depth-limit");

var _disableIntrospection = require("@envelop/disable-introspection");

var _filterOperationType = require("@envelop/filter-operation-type");

var _api = require("@redwoodjs/api");

var _graphql = require("graphql");

var _makeDirectives = require("../directives/makeDirectives");

var _globalContext = require("../globalContext");

var _makeMergedSchema = require("../makeMergedSchema/makeMergedSchema");

var _useRedwoodAuthContext = require("../plugins/useRedwoodAuthContext");

var _useRedwoodDirective = require("../plugins/useRedwoodDirective");

var _useRedwoodGlobalContextSetter = require("../plugins/useRedwoodGlobalContextSetter");

var _useRedwoodLogger = require("../plugins/useRedwoodLogger");

var _useRedwoodPopulateContext = require("../plugins/useRedwoodPopulateContext");

var _errors = require("../errors");

var _crossUndiciFetch = require("cross-undici-fetch");

var _cors = require("../cors");

/* eslint-disable react-hooks/rules-of-hooks */

/*
 * Prevent unexpected error messages from leaking to the GraphQL clients.
 *
 * Unexpected errors are those that are not Envelop, GraphQL, or Redwood errors
 **/
const formatError = (err, message) => {
  const allowErrors = [_common.GraphQLYogaError, _common.EnvelopError, _api.RedwoodError]; // If using graphql-scalars, when validating input
  // the original TypeError is wrapped in an GraphQLError object.
  // We extract out and present the portion of the original error's
  // validation message that is friendly to send to the end user
  // @see https://github.com/Urigo/graphql-scalars and their validate method

  if (err && err instanceof _graphql.GraphQLError) {
    if (err.originalError && err.originalError instanceof TypeError) {
      return new _errors.ValidationError(err.originalError.message);
    }
  }

  if (err.originalError && !(0, _find.default)(allowErrors).call(allowErrors, allowedError => err.originalError instanceof allowedError)) {
    return new _graphql.GraphQLError(message);
  }

  return err;
};
/**
 * Creates an Enveloped GraphQL Server, configured with default Redwood plugins
 *
 * You can add your own plugins by passing them to the extraPlugins object
 *
 * @see https://www.envelop.dev/ for information about envelop
 * @see https://www.envelop.dev/plugins for available envelop plugins
 * ```js
 * export const handler = createGraphQLHandler({ schema, context, getCurrentUser })
 * ```
 */


exports.formatError = formatError;

const createGraphQLHandler = ({
  loggerConfig,
  context,
  getCurrentUser,
  onException,
  generateGraphiQLHeader,
  extraPlugins,
  cors,
  services,
  sdls,
  directives = [],
  depthLimitOptions,
  allowedOperations,
  defaultError = 'Something went wrong.',
  graphiQLEndpoint = '/graphql',
  schemaOptions
}) => {
  let schema;
  let redwoodDirectivePlugins = [];
  const logger = loggerConfig.logger;

  try {
    // @NOTE: Directives are optional
    const projectDirectives = (0, _makeDirectives.makeDirectivesForPlugin)(directives);

    if (projectDirectives.length > 0) {
      redwoodDirectivePlugins = (0, _map.default)(projectDirectives).call(projectDirectives, directive => (0, _useRedwoodDirective.useRedwoodDirective)(directive));
    }

    schema = (0, _makeMergedSchema.makeMergedSchema)({
      sdls,
      services,
      directives: projectDirectives,
      schemaOptions
    });
  } catch (e) {
    logger.fatal(e, '\n ⚠️ GraphQL server crashed \n'); // Forcefully crash the graphql server
    // so users know that a misconfiguration has happened

    process.exit(1);
  } // Important: Plugins are executed in order of their usage, and inject functionality serially,
  // so the order here matters


  const isDevEnv = process.env.NODE_ENV === 'development';
  const plugins = [];

  if (!isDevEnv) {
    plugins.push((0, _disableIntrospection.useDisableIntrospection)());
  } // Custom Redwood plugins


  plugins.push((0, _useRedwoodAuthContext.useRedwoodAuthContext)(getCurrentUser));
  plugins.push((0, _useRedwoodGlobalContextSetter.useRedwoodGlobalContextSetter)());

  if (context) {
    plugins.push((0, _useRedwoodPopulateContext.useRedwoodPopulateContext)(context));
  } // Custom Redwood plugins


  plugins.push(...redwoodDirectivePlugins); // Limits the depth of your GraphQL selection sets.

  plugins.push((0, _depthLimit.useDepthLimit)({
    maxDepth: depthLimitOptions && depthLimitOptions.maxDepth || 10,
    ignore: depthLimitOptions && depthLimitOptions.ignore || []
  })); // Only allow execution of specific operation types

  plugins.push((0, _filterOperationType.useFilterAllowedOperations)(allowedOperations || [_graphql.OperationTypeNode.QUERY, _graphql.OperationTypeNode.MUTATION])); // App-defined plugins

  if (extraPlugins && extraPlugins.length > 0) {
    plugins.push(...extraPlugins);
  } // Must be "last" in plugin chain, but before error masking
  // so can process any data added to results and extensions


  plugins.push((0, _useRedwoodLogger.useRedwoodLogger)(loggerConfig));
  const yoga = (0, _common.createServer)({
    schema,
    plugins,
    maskedErrors: {
      formatError,
      errorMessage: defaultError
    },
    logging: logger,
    graphiql: isDevEnv ? {
      title: 'Redwood GraphQL Playground',
      endpoint: graphiQLEndpoint,
      headers: generateGraphiQLHeader ? generateGraphiQLHeader() : `{"x-auth-comment": "See documentation: https://redwoodjs.com/docs/cli-commands#setup-graphiQL-headers on how to auto generate auth headers"}`,
      defaultQuery: `query Redwood {
  redwood {
    version
  }
}`,
      headerEditorEnabled: true
    } : false,
    cors: request => {
      const requestOrigin = request.headers.get('origin');
      return (0, _cors.mapRwCorsOptionsToYoga)(cors, requestOrigin);
    }
  });

  function buildRequestObject(event) {
    var _event$requestContext;

    const requestHeaders = new _crossUndiciFetch.Headers();

    for (const headerName in event.headers) {
      const headerValue = event.headers[headerName];

      if (headerValue) {
        requestHeaders.append(headerName, headerValue);
      }
    }

    for (const headerName in event.multiValueHeaders) {
      const headerValues = event.multiValueHeaders[headerName];

      if (headerValues) {
        for (const headerValue of headerValues) {
          requestHeaders.append(headerName, headerValue);
        }
      }
    }

    const protocol = isDevEnv ? 'http' : 'https';
    const requestUrl = new _url.default(event.path, protocol + '://' + (((_event$requestContext = event.requestContext) === null || _event$requestContext === void 0 ? void 0 : _event$requestContext.domainName) || 'localhost'));

    if (event.multiValueQueryStringParameters) {
      for (const queryStringParam in event.multiValueQueryStringParameters) {
        const queryStringValues = event.multiValueQueryStringParameters[queryStringParam];

        if (queryStringValues) {
          if ((0, _isArray.default)(queryStringValues)) {
            for (const queryStringValue of queryStringValues) {
              requestUrl.searchParams.append(queryStringParam, queryStringValue);
            }
          } else {
            requestUrl.searchParams.append(queryStringParam, String(queryStringValues));
          }
        }
      }
    } else if (event.queryStringParameters) {
      for (const queryStringParam in event.queryStringParameters) {
        const queryStringValue = event.queryStringParameters[queryStringParam];

        if (queryStringValue) {
          requestUrl.searchParams.append(queryStringParam, queryStringValue);
        }
      }
    }

    if (event.httpMethod === 'GET' || event.httpMethod === 'HEAD' || event.body == null) {
      return new _crossUndiciFetch.Request(requestUrl.toString(), {
        method: event.httpMethod,
        headers: requestHeaders
      });
    } else {
      const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body;
      return new _crossUndiciFetch.Request(requestUrl.toString(), {
        method: event.httpMethod,
        headers: requestHeaders,
        body
      });
    }
  }

  const handlerFn = async (event, lambdaContext) => {
    // In the future, this could be part of a specific handler for AWS lambdas
    lambdaContext.callbackWaitsForEmptyEventLoop = false;
    let lambdaResponse;

    try {
      const request = buildRequestObject(event);
      const response = await yoga.handleRequest(request, {
        event,
        requestContext: lambdaContext
      });
      const multiValueHeaders = {};

      for (const [key, value] of response.headers) {
        multiValueHeaders[key] = multiValueHeaders[key] || [];
        multiValueHeaders[key].push(value);
      }

      lambdaResponse = {
        body: await response.text(),
        statusCode: response.status,
        multiValueHeaders
      };
    } catch (e) {
      logger.error(e);
      onException && onException();
      lambdaResponse = {
        body: (0, _stringify.default)({
          error: 'GraphQL execution failed'
        }),
        statusCode: 200 // should be 500

      };
    }

    if (!lambdaResponse.headers) {
      lambdaResponse.headers = {};
    }

    lambdaResponse.headers['Content-Type'] = 'application/json';
    return lambdaResponse;
  };

  return (event, context) => {
    const execFn = async () => {
      try {
        return await handlerFn(event, context);
      } catch (e) {
        onException && onException();
        throw e;
      }
    };

    if ((0, _globalContext.getAsyncStoreInstance)()) {
      // This must be used when you're self-hosting RedwoodJS.
      return (0, _globalContext.getAsyncStoreInstance)().run(new _map2.default(), execFn);
    } else {
      // This is OK for AWS (Netlify/Vercel) because each Lambda request
      // is handled individually.
      return execFn();
    }
  };
};

exports.createGraphQLHandler = createGraphQLHandler;