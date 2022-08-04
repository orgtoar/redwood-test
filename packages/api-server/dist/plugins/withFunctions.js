"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _urlData = _interopRequireDefault(require("@fastify/url-data"));

var _fastifyRawBody = _interopRequireDefault(require("fastify-raw-body"));

var _fastify = require("../fastify");

var _lambdaLoader = require("./lambdaLoader");

const withFunctions = async (fastify, options) => {
  const {
    apiRootPath
  } = options; // Add extra fastify plugins

  fastify.register(_urlData.default); // Fastify v4 must await the fastifyRawBody plugin
  // registration to ensure the plugin is ready

  await fastify.register(_fastifyRawBody.default);
  const {
    configureFastify
  } = (0, _fastify.loadFastifyConfig)();

  if (configureFastify) {
    await configureFastify(fastify, {
      side: 'api',
      ...options
    });
  }

  fastify.all(`${apiRootPath}:routeName`, _lambdaLoader.lambdaRequestHandler);
  fastify.all(`${apiRootPath}:routeName/*`, _lambdaLoader.lambdaRequestHandler);
  fastify.addContentTypeParser(['application/x-www-form-urlencoded', 'multipart/form-data'], {
    parseAs: 'string'
  }, fastify.defaultTextParser);
  await (0, _lambdaLoader.loadFunctionsFromDist)();
  return fastify;
};

var _default = withFunctions;
exports.default = _default;