"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.setLambdaFunctions = exports.loadFunctionsFromDist = exports.lambdaRequestHandler = exports.LAMBDA_FUNCTIONS = void 0;

var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _findIndex = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find-index"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/splice"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _path = _interopRequireDefault(require("path"));

var _ansiColors = _interopRequireDefault(require("ansi-colors"));

var _lodash = _interopRequireDefault(require("lodash.escape"));

var _files = require("@redwoodjs/internal/dist/files");

var _awsLambdaFastify = require("../requestHandlers/awsLambdaFastify");

const LAMBDA_FUNCTIONS = {}; // Import the API functions and add them to the LAMBDA_FUNCTIONS object

exports.LAMBDA_FUNCTIONS = LAMBDA_FUNCTIONS;

const setLambdaFunctions = async foundFunctions => {
  const tsImport = (0, _now.default)();
  console.log(_ansiColors.default.italic(_ansiColors.default.dim('Importing Server Functions... ')));
  const imports = (0, _map.default)(foundFunctions).call(foundFunctions, fnPath => {
    return new _promise.default(resolve => {
      const ts = (0, _now.default)();

      const routeName = _path.default.basename(fnPath).replace('.js', '');

      const {
        handler
      } = require(fnPath);

      LAMBDA_FUNCTIONS[routeName] = handler;

      if (!handler) {
        console.warn(routeName, 'at', fnPath, 'does not have a function called handler defined.');
      } // TODO: Use terminal link.


      console.log(_ansiColors.default.magenta('/' + routeName), _ansiColors.default.italic(_ansiColors.default.dim((0, _now.default)() - ts + ' ms')));
      return resolve(true);
    });
  });

  _promise.default.all(imports).then(_results => {
    console.log(_ansiColors.default.italic(_ansiColors.default.dim('...Done importing in ' + ((0, _now.default)() - tsImport) + ' ms')));
  });
}; // TODO: Use v8 caching to load these crazy fast.


exports.setLambdaFunctions = setLambdaFunctions;

const loadFunctionsFromDist = async () => {
  const serverFunctions = (0, _files.findApiDistFunctions)(); // Place `GraphQL` serverless function at the start.

  const i = (0, _findIndex.default)(serverFunctions).call(serverFunctions, x => (0, _indexOf.default)(x).call(x, 'graphql') !== -1);

  if (i >= 0) {
    const graphQLFn = (0, _splice.default)(serverFunctions).call(serverFunctions, i, 1)[0];
    serverFunctions.unshift(graphQLFn);
  }

  await setLambdaFunctions(serverFunctions);
};

exports.loadFunctionsFromDist = loadFunctionsFromDist;

/**
 This will take a fastify request
 Then convert it to a lambdaEvent, and pass it to the the appropriate handler for the routeName
 The LAMBDA_FUNCTIONS lookup has been populated already by this point
 **/
const lambdaRequestHandler = async (req, reply) => {
  const {
    routeName
  } = req.params;

  if (!LAMBDA_FUNCTIONS[routeName]) {
    const errorMessage = `Function "${routeName}" was not found.`;
    req.log.error(errorMessage);
    reply.status(404);

    if (process.env.NODE_ENV === 'development') {
      const devError = {
        error: errorMessage,
        availableFunctions: (0, _keys.default)(LAMBDA_FUNCTIONS)
      };
      reply.send(devError);
    } else {
      reply.send((0, _lodash.default)(errorMessage));
    }

    return;
  }

  return (0, _awsLambdaFastify.requestHandler)(req, reply, LAMBDA_FUNCTIONS[routeName]);
};

exports.lambdaRequestHandler = lambdaRequestHandler;