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
var formatters_exports = {};
__export(formatters_exports, {
  NEWLINE: () => NEWLINE,
  emojiLog: () => emojiLog,
  formatBundleSize: () => formatBundleSize,
  formatCustom: () => formatCustom,
  formatData: () => formatData,
  formatDate: () => formatDate,
  formatErrorProp: () => formatErrorProp,
  formatLevel: () => formatLevel,
  formatLoadTime: () => formatLoadTime,
  formatMessage: () => formatMessage,
  formatMessageName: () => formatMessageName,
  formatMethod: () => formatMethod,
  formatName: () => formatName,
  formatNs: () => formatNs,
  formatOperationName: () => formatOperationName,
  formatQuery: () => formatQuery,
  formatRequestId: () => formatRequestId,
  formatResponseCache: () => formatResponseCache,
  formatStack: () => formatStack,
  formatStatusCode: () => formatStatusCode,
  formatTracing: () => formatTracing,
  formatUrl: () => formatUrl,
  formatUserAgent: () => formatUserAgent,
  ignoredCustomData: () => ignoredCustomData,
  isEmptyObject: () => isEmptyObject,
  isObject: () => isObject,
  isPinoLog: () => isPinoLog,
  isWideEmoji: () => isWideEmoji,
  noEmpty: () => noEmpty
});
module.exports = __toCommonJS(formatters_exports);
var import_chalk = __toESM(require("chalk"));
var import_pretty_bytes = __toESM(require("pretty-bytes"));
var import_pretty_ms = __toESM(require("pretty-ms"));
const NEWLINE = "\n";
const emojiLog = {
  warn: "\u{1F6A6}",
  info: "\u{1F332}",
  error: "\u{1F6A8}",
  debug: "\u{1F41B}",
  fatal: "\u{1F480}",
  trace: "\u{1F9F5}"
};
const ignoredCustomData = [
  "time",
  "pid",
  "hostname",
  "msg",
  "res",
  "req",
  "reqId",
  "responseTime"
];
const isObject = (object) => {
  return object && Object.prototype.toString.apply(object) === "[object Object]";
};
const isEmptyObject = (object) => {
  return object && !Object.keys(object).length;
};
const isPinoLog = (log) => {
  return log && Object.prototype.hasOwnProperty.call(log, "level");
};
const isWideEmoji = (character) => {
  return character !== "\u{1F6A6}";
};
const formatBundleSize = (bundle) => {
  const bytes = parseInt(bundle, 10);
  const size = (0, import_pretty_bytes.default)(bytes).replace(/ /, "");
  return import_chalk.default.gray(size);
};
const formatCustom = (query) => {
  if (!query) {
    return;
  }
  ignoredCustomData.forEach((key) => {
    delete query[key];
  });
  if (!isEmptyObject(query)) {
    return import_chalk.default.white(
      NEWLINE + "\u{1F5D2} Custom" + NEWLINE + JSON.stringify(query, null, 2)
    );
  }
  return;
};
const formatData = (data) => {
  if (!isEmptyObject(data)) {
    return import_chalk.default.white(
      NEWLINE + "\u{1F4E6} Result Data" + NEWLINE + JSON.stringify(data, null, 2)
    );
  }
  return;
};
const formatDate = (instant) => {
  const date = new Date(instant);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const prettyDate = hours + ":" + minutes + ":" + seconds;
  return import_chalk.default.gray(prettyDate);
};
const formatErrorProp = (errorPropValue) => {
  const errorType = errorPropValue["type"] || "Error";
  delete errorPropValue["message"];
  delete errorPropValue["stack"];
  delete errorPropValue["type"];
  return import_chalk.default.redBright(
    NEWLINE + NEWLINE + `\u{1F6A8} ${errorType} Info` + NEWLINE + NEWLINE + JSON.stringify(errorPropValue, null, 2) + NEWLINE
  );
};
const formatLevel = (level) => {
  const emoji = emojiLog[level];
  const padding = isWideEmoji(emoji) ? "" : " ";
  return emoji + padding;
};
const formatLoadTime = (elapsedTime) => {
  const elapsed = parseInt(elapsedTime, 10);
  const time = (0, import_pretty_ms.default)(elapsed);
  return import_chalk.default.gray(time);
};
const formatMessage = (logData) => {
  const { level, message } = logData;
  const msg = formatMessageName(message);
  let pretty;
  if (level === "error") {
    pretty = import_chalk.default.red(msg);
  }
  if (level === "trace") {
    pretty = import_chalk.default.white(msg);
  }
  if (level === "warn") {
    pretty = import_chalk.default.magenta(msg);
  }
  if (level === "debug") {
    pretty = import_chalk.default.yellow(msg);
  }
  if (level === "info" || level === "customlevel") {
    pretty = import_chalk.default.green(msg);
  }
  if (level === "fatal") {
    pretty = import_chalk.default.white.bgRed(msg);
  }
  return pretty;
};
const formatMethod = (method) => {
  return method && import_chalk.default.white(method);
};
const formatRequestId = (requestId) => {
  return requestId && import_chalk.default.cyan(requestId);
};
const formatNs = (ns) => {
  return ns && import_chalk.default.cyan(ns);
};
const formatName = (name) => {
  return name && import_chalk.default.blue(name);
};
const formatMessageName = (message) => {
  if (message === void 0) {
    return "";
  }
  if (message === "request") {
    return "<--";
  }
  if (message === "response") {
    return "-->";
  }
  return message;
};
const formatOperationName = (operationName) => {
  return import_chalk.default.white(NEWLINE + "\u{1F3F7}  " + operationName);
};
const formatQuery = (query) => {
  if (!isEmptyObject(query)) {
    return import_chalk.default.white(
      NEWLINE + "\u{1F52D} Query" + NEWLINE + JSON.stringify(query, null, 2)
    );
  }
  return;
};
const formatResponseCache = (responseCache) => {
  if (!isEmptyObject(responseCache)) {
    return import_chalk.default.white(
      NEWLINE + "\u{1F4BE} Response Cache" + NEWLINE + JSON.stringify(responseCache, null, 2)
    );
  }
  return;
};
const formatStatusCode = (statusCode) => {
  statusCode = statusCode || "xxx";
  return import_chalk.default.white(statusCode);
};
const formatStack = (stack) => {
  return import_chalk.default.redBright(
    stack ? NEWLINE + "\u{1F95E} Error Stack" + NEWLINE + NEWLINE + stack + NEWLINE : ""
  );
};
const formatTracing = (data) => {
  if (!isEmptyObject(data)) {
    return import_chalk.default.white(
      NEWLINE + "\u23F0 Timing" + NEWLINE + JSON.stringify(data, null, 2)
    );
  }
  return;
};
const formatUrl = (url) => {
  return import_chalk.default.white(url);
};
const formatUserAgent = (userAgent) => {
  return import_chalk.default.grey(NEWLINE + "\u{1F575}\uFE0F\u200D\u2640\uFE0F " + userAgent);
};
const noEmpty = (value) => {
  return !!value;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NEWLINE,
  emojiLog,
  formatBundleSize,
  formatCustom,
  formatData,
  formatDate,
  formatErrorProp,
  formatLevel,
  formatLoadTime,
  formatMessage,
  formatMessageName,
  formatMethod,
  formatName,
  formatNs,
  formatOperationName,
  formatQuery,
  formatRequestId,
  formatResponseCache,
  formatStack,
  formatStatusCode,
  formatTracing,
  formatUrl,
  formatUserAgent,
  ignoredCustomData,
  isEmptyObject,
  isObject,
  isPinoLog,
  isWideEmoji,
  noEmpty
});
