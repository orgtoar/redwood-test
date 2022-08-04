"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.useRedwoodLogger = void 0;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _common = require("@graphql-yoga/common");

var _graphql = require("graphql");

var _uuid = require("uuid");

var _errors = require("../errors");

/**
 * This function is used by the useRedwoodLogger to
 * logs every time an operation is being executed and
 * when the execution of the operation is done.
 */
const logResult = (loggerConfig, envelopLogger, operationName) => ({
  result
}) => {
  const includeTracing = loggerConfig?.options?.tracing;
  const includeData = loggerConfig?.options?.data;
  const options = {};

  if (result?.errors && result?.errors.length > 0) {
    var _context;

    (0, _forEach.default)(_context = result.errors).call(_context, error => {
      if (error.originalError && (error.originalError instanceof _errors.AuthenticationError || error.originalError instanceof _errors.ForbiddenError)) {
        envelopLogger.warn(error, `'${error?.extensions?.code || 'authentication'}' error '${error.message}' occurred in ${operationName}`);
      } else {
        envelopLogger.error(error, error?.originalError?.message || error.message || `Error in GraphQL execution: ${operationName}`);
      }
    });
  }

  if (result?.data) {
    if (includeData) {
      options['data'] = result.data;
    }

    if (result.extensions?.responseCache) {
      options['responseCache'] = result.extensions?.responseCache;
    }

    if (includeTracing) {
      options['tracing'] = result.extensions?.envelopTracing;
    }

    envelopLogger.debug({ ...options
    }, `GraphQL execution completed: ${operationName}`);
  }
};
/**
 * This plugin logs every time an operation is being executed and
 * when the execution of the operation is done.
 *
 * It adds information using a child logger from the context
 * such as the operation name, request id, errors, and header info
 * to help trace and diagnose issues.
 *
 * Tracing and timing information can be enabled via the
 * GraphQLHandlerOptions traction option.
 *
 * @see https://www.envelop.dev/docs/plugins/lifecycle
 * @returns
 */


const useRedwoodLogger = loggerConfig => {
  const logger = loggerConfig.logger;
  const level = loggerConfig.options?.level || logger.level || 'warn';
  const childLogger = logger.child({
    name: 'graphql-server'
  });
  childLogger.level = level;
  const includeOperationName = loggerConfig?.options?.operationName;
  const includeRequestId = loggerConfig?.options?.requestId;
  const includeUserAgent = loggerConfig?.options?.userAgent;
  const includeQuery = loggerConfig?.options?.query;
  const excludeOperations = loggerConfig.options?.excludeOperations;
  return {
    onPluginInit(context) {
      context.registerContextErrorHandler(({
        error
      }) => {
        if (error) {
          childLogger.error(`Error building context. ${error}`);
        }
      });
    },

    onParse({
      params
    }) {
      const options = params.options;
      const envelopLogger = childLogger.child({ ...options
      });
      return ({
        result
      }) => {
        if (result instanceof Error) {
          envelopLogger.error(result);
        }
      };
    },

    onValidate({
      params
    }) {
      const options = params.options;
      const envelopLogger = childLogger.child({ ...options
      });
      return ({
        result
      }) => {
        (0, _forEach.default)(result).call(result, item => {
          item.message && envelopLogger.error(item.message);
        });
      };
    },

    onExecute({
      args
    }) {
      var _context2;

      const options = {};
      const rootOperation = (0, _find.default)(_context2 = args.document.definitions).call(_context2, o => o.kind === _graphql.Kind.OPERATION_DEFINITION);
      const operationName = args.operationName || rootOperation.name?.value || 'Anonymous Operation';

      if (excludeOperations?.includes(operationName)) {
        return;
      }

      if (includeOperationName) {
        options['operationName'] = operationName;
      }

      if (includeQuery) {
        options['query'] = args.variableValues;
      }

      if (includeRequestId) {
        options['requestId'] = args.contextValue.requestContext?.awsRequestId || args.contextValue.event?.requestContext?.requestId || (0, _uuid.v4)();
      }

      if (includeUserAgent) {
        options['userAgent'] = args.contextValue.event?.headers['user-agent'];
      }

      const envelopLogger = childLogger.child({ ...options
      });
      envelopLogger.debug(`GraphQL execution started: ${operationName}`);
      const handleResult = logResult(loggerConfig, envelopLogger, operationName);
      return {
        onExecuteDone: payload => {
          (0, _common.handleStreamOrSingleExecutionResult)(payload, ({
            result
          }) => {
            handleResult({
              result
            });
            return undefined;
          });
        }
      };
    }

  };
};

exports.useRedwoodLogger = useRedwoodLogger;