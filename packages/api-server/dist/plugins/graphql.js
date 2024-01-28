"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.redwoodFastifyGraphQLServer = redwoodFastifyGraphQLServer;
require("core-js/modules/es.array.push.js");
var _urlData = _interopRequireDefault(require("@fastify/url-data"));
var _fastGlob = _interopRequireDefault(require("fast-glob"));
var _fastifyRawBody = _interopRequireDefault(require("fastify-raw-body"));
var _graphqlServer = require("@redwoodjs/graphql-server");
var _projectConfig = require("@redwoodjs/project-config");
var _awsLambdaFastify = require("../requestHandlers/awsLambdaFastify");
/**
 * Transform a Fastify Request to an event compatible with the RedwoodGraphQLContext's event
 * which is based on the AWS Lambda event
 */

/**
 * Redwood GraphQL Server Fastify plugin based on GraphQL Yoga
 *
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {GraphQLYogaOptions} options GraphQLYogaOptions options used to configure the GraphQL Yoga Server
 */
async function redwoodFastifyGraphQLServer(fastify, options, done) {
  // These two plugins are needed to transform a Fastify Request to a Lambda event
  // which is used by the RedwoodGraphQLContext and mimics the behavior of the
  // api-server withFunction plugin
  if (!fastify.hasPlugin('@fastify/url-data')) {
    await fastify.register(_urlData.default);
  }
  await fastify.register(_fastifyRawBody.default);
  try {
    const method = ['GET', 'POST', 'OPTIONS'];

    // Load the graphql options from the graphql function if none are explicitly provided
    if (!options.redwood.graphql) {
      const [graphqlFunctionPath] = await (0, _fastGlob.default)('dist/functions/graphql.{ts,js}', {
        cwd: (0, _projectConfig.getPaths)().api.base,
        absolute: true
      });
      const {
        __rw_graphqlOptions
      } = await import(graphqlFunctionPath);
      options.redwood.graphql = __rw_graphqlOptions;
    }
    const graphqlOptions = options.redwood.graphql;

    // Here we can add any plugins that we want to use with GraphQL Yoga Server
    // that we do not want to add the the GraphQLHandler in the graphql-server
    // graphql function.
    //
    // These would be plugins that need a server instance such as Redwood Realtime
    if (graphqlOptions?.realtime) {
      const {
        useRedwoodRealtime
      } = await import('@redwoodjs/realtime');
      const originalExtraPlugins = graphqlOptions.extraPlugins || [];
      originalExtraPlugins.push(useRedwoodRealtime(graphqlOptions.realtime));
      graphqlOptions.extraPlugins = originalExtraPlugins;

      // uses for SSE single connection mode with the `/graphql/stream` endpoint
      if (graphqlOptions.realtime.subscriptions) {
        method.push('PUT');
      }
    }
    const {
      yoga
    } = (0, _graphqlServer.createGraphQLYoga)(graphqlOptions);
    const graphQLYogaHandler = async (req, reply) => {
      const response = await yoga.handleNodeRequest(req, {
        req,
        reply,
        event: (0, _awsLambdaFastify.lambdaEventForFastifyRequest)(req),
        requestContext: {}
      });
      for (const [name, value] of response.headers) {
        reply.header(name, value);
      }
      reply.status(response.status);
      reply.send(response.body);
      return reply;
    };
    const routePaths = ['', '/health', '/readiness', '/stream'];
    for (const routePath of routePaths) {
      fastify.route({
        url: `${options.redwood.apiRootPath}${formatGraphQLEndpoint(yoga.graphqlEndpoint)}${routePath}`,
        method,
        handler: async (req, reply) => await graphQLYogaHandler(req, reply)
      });
    }
    fastify.addHook('onReady', done => {
      console.info(`GraphQL Yoga Server endpoint at ${yoga.graphqlEndpoint}`);
      console.info(`GraphQL Yoga Server Health Check endpoint at ${yoga.graphqlEndpoint}/health`);
      console.info(`GraphQL Yoga Server Readiness endpoint at ${yoga.graphqlEndpoint}/readiness`);
      done();
    });
    done();
  } catch (e) {
    console.log(e);
  }
}
function formatGraphQLEndpoint(endpoint) {
  return endpoint.replace(/^\//, '').replace(/\/$/, '');
}