"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRedwoodLogger = void 0;

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

require("core-js/modules/esnext.async-iterator.find.js");

require("core-js/modules/esnext.iterator.find.js");

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
  var _loggerConfig$options, _loggerConfig$options2;

  const includeTracing = loggerConfig === null || loggerConfig === void 0 ? void 0 : (_loggerConfig$options = loggerConfig.options) === null || _loggerConfig$options === void 0 ? void 0 : _loggerConfig$options.tracing;
  const includeData = loggerConfig === null || loggerConfig === void 0 ? void 0 : (_loggerConfig$options2 = loggerConfig.options) === null || _loggerConfig$options2 === void 0 ? void 0 : _loggerConfig$options2.data;
  const options = {};

  if (result !== null && result !== void 0 && result.errors && (result === null || result === void 0 ? void 0 : result.errors.length) > 0) {
    result.errors.forEach(error => {
      if (error.originalError && (error.originalError instanceof _errors.AuthenticationError || error.originalError instanceof _errors.ForbiddenError)) {
        var _error$extensions;

        envelopLogger.warn(error, `'${(error === null || error === void 0 ? void 0 : (_error$extensions = error.extensions) === null || _error$extensions === void 0 ? void 0 : _error$extensions.code) || 'authentication'}' error '${error.message}' occurred in ${operationName}`);
      } else {
        var _error$originalError;

        envelopLogger.error(error, (error === null || error === void 0 ? void 0 : (_error$originalError = error.originalError) === null || _error$originalError === void 0 ? void 0 : _error$originalError.message) || error.message || `Error in GraphQL execution: ${operationName}`);
      }
    });
  }

  if (result !== null && result !== void 0 && result.data) {
    var _result$extensions;

    if (includeData) {
      options['data'] = result.data;
    }

    if ((_result$extensions = result.extensions) !== null && _result$extensions !== void 0 && _result$extensions.responseCache) {
      var _result$extensions2;

      options['responseCache'] = (_result$extensions2 = result.extensions) === null || _result$extensions2 === void 0 ? void 0 : _result$extensions2.responseCache;
    }

    if (includeTracing) {
      var _result$extensions3;

      options['tracing'] = (_result$extensions3 = result.extensions) === null || _result$extensions3 === void 0 ? void 0 : _result$extensions3.envelopTracing;
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
  var _loggerConfig$options3, _loggerConfig$options4, _loggerConfig$options5, _loggerConfig$options6, _loggerConfig$options7, _loggerConfig$options8;

  const logger = loggerConfig.logger;
  const level = ((_loggerConfig$options3 = loggerConfig.options) === null || _loggerConfig$options3 === void 0 ? void 0 : _loggerConfig$options3.level) || logger.level || 'warn';
  const childLogger = logger.child({
    name: 'graphql-server'
  });
  childLogger.level = level;
  const includeOperationName = loggerConfig === null || loggerConfig === void 0 ? void 0 : (_loggerConfig$options4 = loggerConfig.options) === null || _loggerConfig$options4 === void 0 ? void 0 : _loggerConfig$options4.operationName;
  const includeRequestId = loggerConfig === null || loggerConfig === void 0 ? void 0 : (_loggerConfig$options5 = loggerConfig.options) === null || _loggerConfig$options5 === void 0 ? void 0 : _loggerConfig$options5.requestId;
  const includeUserAgent = loggerConfig === null || loggerConfig === void 0 ? void 0 : (_loggerConfig$options6 = loggerConfig.options) === null || _loggerConfig$options6 === void 0 ? void 0 : _loggerConfig$options6.userAgent;
  const includeQuery = loggerConfig === null || loggerConfig === void 0 ? void 0 : (_loggerConfig$options7 = loggerConfig.options) === null || _loggerConfig$options7 === void 0 ? void 0 : _loggerConfig$options7.query;
  const excludeOperations = (_loggerConfig$options8 = loggerConfig.options) === null || _loggerConfig$options8 === void 0 ? void 0 : _loggerConfig$options8.excludeOperations;
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
        result.forEach(item => {
          item.message && envelopLogger.error(item.message);
        });
      };
    },

    onExecute({
      args
    }) {
      var _rootOperation$name;

      const options = {};
      const rootOperation = args.document.definitions.find(o => o.kind === _graphql.Kind.OPERATION_DEFINITION);
      const operationName = args.operationName || ((_rootOperation$name = rootOperation.name) === null || _rootOperation$name === void 0 ? void 0 : _rootOperation$name.value) || 'Anonymous Operation';

      if (excludeOperations !== null && excludeOperations !== void 0 && excludeOperations.includes(operationName)) {
        return;
      }

      if (includeOperationName) {
        options['operationName'] = operationName;
      }

      if (includeQuery) {
        options['query'] = args.variableValues;
      }

      if (includeRequestId) {
        var _args$contextValue$re, _args$contextValue$ev, _args$contextValue$ev2;

        options['requestId'] = ((_args$contextValue$re = args.contextValue.requestContext) === null || _args$contextValue$re === void 0 ? void 0 : _args$contextValue$re.awsRequestId) || ((_args$contextValue$ev = args.contextValue.event) === null || _args$contextValue$ev === void 0 ? void 0 : (_args$contextValue$ev2 = _args$contextValue$ev.requestContext) === null || _args$contextValue$ev2 === void 0 ? void 0 : _args$contextValue$ev2.requestId) || (0, _uuid.v4)();
      }

      if (includeUserAgent) {
        var _args$contextValue$ev3;

        options['userAgent'] = (_args$contextValue$ev3 = args.contextValue.event) === null || _args$contextValue$ev3 === void 0 ? void 0 : _args$contextValue$ev3.headers['user-agent'];
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