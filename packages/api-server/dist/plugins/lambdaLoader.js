"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLambdaFunctions = exports.loadFunctionsFromDist = exports.lambdaRequestHandler = exports.LAMBDA_FUNCTIONS = void 0;

var _path = _interopRequireDefault(require("path"));

var _ansiColors = _interopRequireDefault(require("ansi-colors"));

var _lodash = _interopRequireDefault(require("lodash.escape"));

var _files = require("@redwoodjs/internal/dist/files");

var _awsLambdaFastify = require("../requestHandlers/awsLambdaFastify");

const LAMBDA_FUNCTIONS = {}; // Import the API functions and add them to the LAMBDA_FUNCTIONS object

exports.LAMBDA_FUNCTIONS = LAMBDA_FUNCTIONS;

const setLambdaFunctions = async foundFunctions => {
  const tsImport = Date.now();
  console.log(_ansiColors.default.italic(_ansiColors.default.dim('Importing Server Functions... ')));
  const imports = foundFunctions.map(fnPath => {
    return new Promise(resolve => {
      const ts = Date.now();

      const routeName = _path.default.basename(fnPath).replace('.js', '');

      const {
        handler
      } = require(fnPath);

      LAMBDA_FUNCTIONS[routeName] = handler;

      if (!handler) {
        console.warn(routeName, 'at', fnPath, 'does not have a function called handler defined.');
      } // TODO: Use terminal link.


      console.log(_ansiColors.default.magenta('/' + routeName), _ansiColors.default.italic(_ansiColors.default.dim(Date.now() - ts + ' ms')));
      return resolve(true);
    });
  });
  Promise.all(imports).then(_results => {
    console.log(_ansiColors.default.italic(_ansiColors.default.dim('...Done importing in ' + (Date.now() - tsImport) + ' ms')));
  });
}; // TODO: Use v8 caching to load these crazy fast.


exports.setLambdaFunctions = setLambdaFunctions;

const loadFunctionsFromDist = async () => {
  const serverFunctions = (0, _files.findApiDistFunctions)(); // Place `GraphQL` serverless function at the start.

  const i = serverFunctions.findIndex(x => x.indexOf('graphql') !== -1);

  if (i >= 0) {
    const graphQLFn = serverFunctions.splice(i, 1)[0];
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
        availableFunctions: Object.keys(LAMBDA_FUNCTIONS)
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