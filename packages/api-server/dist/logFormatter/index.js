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
var logFormatter_exports = {};
__export(logFormatter_exports, {
  LogFormatter: () => LogFormatter
});
module.exports = __toCommonJS(logFormatter_exports);
var import_fast_json_parse = __toESM(require("fast-json-parse"));
var import_formatters = require("./formatters");
const LogFormatter = () => {
  const parse = (inputData) => {
    let logData;
    if (typeof inputData === "string") {
      const parsedData = (0, import_fast_json_parse.default)(inputData);
      if (!parsedData.value || parsedData.err || !(0, import_formatters.isPinoLog)(parsedData.value)) {
        return inputData + import_formatters.NEWLINE;
      }
      logData = parsedData.value;
    } else if ((0, import_formatters.isObject)(inputData) && (0, import_formatters.isPinoLog)(inputData)) {
      logData = inputData;
    } else {
      return inputData + import_formatters.NEWLINE;
    }
    if (!logData.level) {
      return inputData + import_formatters.NEWLINE;
    }
    if (!logData.message) {
      logData.message = logData.msg;
    }
    if (typeof logData.level === "number") {
      convertLogNumber(logData);
    }
    return output(logData) + import_formatters.NEWLINE;
  };
  const convertLogNumber = (logData) => {
    if (logData.level === 10) {
      logData.level = "trace";
    }
    if (logData.level === 20) {
      logData.level = "debug";
    }
    if (logData.level === 30) {
      logData.level = "info";
    }
    if (logData.level === 40) {
      logData.level = "warn";
    }
    if (logData.level === 50) {
      logData.level = "error";
    }
    if (logData.level === 60) {
      logData.level = "fatal";
    }
  };
  const output = (logData) => {
    const output2 = [];
    output2.push((0, import_formatters.formatDate)(logData.time || Date.now()));
    output2.push((0, import_formatters.formatLevel)(logData.level));
    output2.push((0, import_formatters.formatNs)(logData.ns));
    output2.push((0, import_formatters.formatName)(logData.name));
    output2.push((0, import_formatters.formatRequestId)(logData.requestId));
    output2.push((0, import_formatters.formatMessage)(logData));
    const req = logData.req;
    const res = logData.res;
    const { statusCode: responseStatusCode } = res || {};
    const { method: requestMethod, url: requestUrl } = req || {};
    const {
      level,
      message,
      name,
      ns,
      err: logDataErr,
      stack: logDataStack,
      statusCode: logDataStatusCode,
      elapsed,
      responseTime: logDataResponseTime,
      method: logDataMethod,
      custom,
      contentLength,
      operationName,
      query,
      data: graphQLData,
      responseCache,
      tracing,
      url: logDataUrl,
      userAgent,
      ...rest
    } = logData;
    const statusCode = responseStatusCode || logDataStatusCode;
    const responseTime = logDataResponseTime || elapsed;
    const method = requestMethod || logDataMethod;
    const url = requestUrl || logDataUrl;
    const logDataErrStack = logDataErr && logDataErr.stack;
    const stack = level === "fatal" || level === "error" ? logDataStack || logDataErr && logDataErrStack : null;
    const err = (level === "fatal" || level === "error") && logDataErr && Object.keys(logDataErr).find((key) => key !== "stack") ? logDataErr : null;
    if (!message) {
      logData.message = "";
    }
    if (!level) {
      logData.level = "customlevel";
    }
    if (!name) {
      logData.name = "";
    }
    if (!ns) {
      logData.ns = "";
    }
    if (method != null) {
      output2.push((0, import_formatters.formatMethod)(method));
      output2.push((0, import_formatters.formatStatusCode)(statusCode));
    }
    if (url != null) {
      output2.push((0, import_formatters.formatUrl)(url));
    }
    if (contentLength != null) {
      output2.push((0, import_formatters.formatBundleSize)(contentLength));
    }
    if (custom) {
      output2.push((0, import_formatters.formatCustom)(custom));
    }
    if (responseTime != null) {
      output2.push((0, import_formatters.formatLoadTime)(responseTime));
    }
    if (userAgent != null) {
      output2.push((0, import_formatters.formatUserAgent)(userAgent));
    }
    if (operationName != null) {
      output2.push((0, import_formatters.formatOperationName)(operationName));
    }
    if (query != null) {
      output2.push((0, import_formatters.formatQuery)(query));
    }
    if (graphQLData != null) {
      output2.push((0, import_formatters.formatData)(graphQLData));
    }
    if (responseCache != null) {
      output2.push((0, import_formatters.formatResponseCache)(responseCache));
    }
    if (tracing != null) {
      output2.push((0, import_formatters.formatTracing)(tracing));
    }
    if (err != null) {
      output2.push((0, import_formatters.formatErrorProp)(err));
    }
    if (stack != null) {
      output2.push((0, import_formatters.formatStack)(stack));
    }
    if (rest) {
      output2.push((0, import_formatters.formatCustom)(rest));
    }
    return output2.filter(import_formatters.noEmpty).join(" ");
  };
  return parse;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LogFormatter
});
