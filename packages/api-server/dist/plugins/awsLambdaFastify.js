"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var awsLambdaFastify_exports = {};
__export(awsLambdaFastify_exports, {
  lambdaEventForFastifyRequest: () => lambdaEventForFastifyRequest,
  mergeMultiValueHeaders: () => mergeMultiValueHeaders,
  parseBody: () => parseBody,
  requestHandler: () => requestHandler
});
module.exports = __toCommonJS(awsLambdaFastify_exports);
var import_qs = __toESM(require("qs"));
const lambdaEventForFastifyRequest = (request) => {
  return {
    httpMethod: request.method,
    headers: request.headers,
    path: request.urlData("path"),
    queryStringParameters: import_qs.default.parse(request.url.split(/\?(.+)/)[1]),
    requestContext: {
      requestId: request.id,
      identity: {
        sourceIp: request.ip
      }
    },
    ...parseBody(request.rawBody || "")
    // adds `body` and `isBase64Encoded`
  };
};
const fastifyResponseForLambdaResult = (reply, lambdaResult) => {
  const {
    statusCode = 200,
    headers,
    body = "",
    multiValueHeaders
  } = lambdaResult;
  const mergedHeaders = mergeMultiValueHeaders(headers, multiValueHeaders);
  Object.entries(mergedHeaders).forEach(
    ([name, values]) => values.forEach((value) => reply.header(name, value))
  );
  reply.status(statusCode);
  if (lambdaResult.isBase64Encoded) {
    return reply.send(Buffer.from(body, "base64"));
  } else {
    return reply.send(body);
  }
};
const fastifyResponseForLambdaError = (req, reply, error) => {
  req.log.error(error);
  reply.status(500).send();
};
const requestHandler = async (req, reply, handler) => {
  const event = lambdaEventForFastifyRequest(req);
  const handlerCallback = (reply2) => (error, lambdaResult) => {
    if (error) {
      fastifyResponseForLambdaError(req, reply2, error);
      return;
    }
    fastifyResponseForLambdaResult(reply2, lambdaResult);
  };
  const handlerPromise = handler(
    event,
    // @ts-expect-error - Add support for context: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/0bb210867d16170c4a08d9ce5d132817651a0f80/types/aws-lambda/index.d.ts#L443-L467
    {},
    handlerCallback(reply)
  );
  if (handlerPromise && typeof handlerPromise.then === "function") {
    try {
      const lambdaResponse = await handlerPromise;
      return fastifyResponseForLambdaResult(reply, lambdaResponse);
    } catch (error) {
      return fastifyResponseForLambdaError(req, reply, error);
    }
  }
};
const parseBody = (rawBody) => {
  if (typeof rawBody === "string") {
    return { body: rawBody, isBase64Encoded: false };
  }
  if (rawBody instanceof Buffer) {
    return { body: rawBody.toString("base64"), isBase64Encoded: true };
  }
  return { body: "", isBase64Encoded: false };
};
const mergeMultiValueHeaders = (headers, multiValueHeaders) => {
  const mergedHeaders = Object.entries(
    headers || {}
  ).reduce((acc, [name, value]) => {
    acc[name.toLowerCase()] = [value];
    return acc;
  }, {});
  Object.entries(multiValueHeaders || {}).forEach(([headerName, values]) => {
    const name = headerName.toLowerCase();
    if (name.toLowerCase() === "set-cookie") {
      mergedHeaders["set-cookie"] = values;
    } else {
      mergedHeaders[name] = [values.join("; ")];
    }
  });
  return mergedHeaders;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  lambdaEventForFastifyRequest,
  mergeMultiValueHeaders,
  parseBody,
  requestHandler
});
