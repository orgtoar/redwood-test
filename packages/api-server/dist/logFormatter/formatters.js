"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.noEmpty = exports.isWideEmoji = exports.isPinoLog = exports.isObject = exports.isEmptyObject = exports.ignoredCustomData = exports.formatUserAgent = exports.formatUrl = exports.formatTracing = exports.formatStatusCode = exports.formatStack = exports.formatResponseCache = exports.formatRequestId = exports.formatQuery = exports.formatOperationName = exports.formatNs = exports.formatName = exports.formatMethod = exports.formatMessageName = exports.formatMessage = exports.formatLoadTime = exports.formatLevel = exports.formatErrorProp = exports.formatDate = exports.formatData = exports.formatCustom = exports.formatBundleSize = exports.emojiLog = exports.NEWLINE = void 0;
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _padStart = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/pad-start"));
var _chalk = _interopRequireDefault(require("chalk"));
var _prettyBytes = _interopRequireDefault(require("pretty-bytes"));
var _prettyMs = _interopRequireDefault(require("pretty-ms"));
const NEWLINE = exports.NEWLINE = '\n';
const emojiLog = exports.emojiLog = {
  warn: '🚦',
  info: '🌲',
  error: '🚨',
  debug: '🐛',
  fatal: '💀',
  trace: '🧵'
};
const ignoredCustomData = exports.ignoredCustomData = ['time', 'pid', 'hostname', 'msg', 'res', 'req', 'reqId', 'responseTime'];
const isObject = object => {
  return object && Object.prototype.toString.apply(object) === '[object Object]';
};
exports.isObject = isObject;
const isEmptyObject = object => {
  return object && !(0, _keys.default)(object).length;
};
exports.isEmptyObject = isEmptyObject;
const isPinoLog = log => {
  return log && Object.prototype.hasOwnProperty.call(log, 'level');
};
exports.isPinoLog = isPinoLog;
const isWideEmoji = character => {
  return character !== '🚦';
};
exports.isWideEmoji = isWideEmoji;
const formatBundleSize = bundle => {
  const bytes = (0, _parseInt2.default)(bundle, 10);
  const size = (0, _prettyBytes.default)(bytes).replace(/ /, '');
  return _chalk.default.gray(size);
};
exports.formatBundleSize = formatBundleSize;
const formatCustom = query => {
  if (!query) {
    return;
  }
  (0, _forEach.default)(ignoredCustomData).call(ignoredCustomData, key => {
    delete query[key];
  });
  if (!isEmptyObject(query)) {
    return _chalk.default.white(NEWLINE + '🗒 Custom' + NEWLINE + (0, _stringify.default)(query, null, 2));
  }
  return;
};
exports.formatCustom = formatCustom;
const formatData = data => {
  if (!isEmptyObject(data)) {
    return _chalk.default.white(NEWLINE + '📦 Result Data' + NEWLINE + (0, _stringify.default)(data, null, 2));
  }
  return;
};
exports.formatData = formatData;
const formatDate = instant => {
  var _context, _context2, _context3;
  const date = new Date(instant);
  const hours = (0, _padStart.default)(_context = date.getHours().toString()).call(_context, 2, '0');
  const minutes = (0, _padStart.default)(_context2 = date.getMinutes().toString()).call(_context2, 2, '0');
  const seconds = (0, _padStart.default)(_context3 = date.getSeconds().toString()).call(_context3, 2, '0');
  const prettyDate = hours + ':' + minutes + ':' + seconds;
  return _chalk.default.gray(prettyDate);
};
exports.formatDate = formatDate;
const formatErrorProp = errorPropValue => {
  const errorType = errorPropValue['type'] || 'Error';
  delete errorPropValue['message'];
  delete errorPropValue['stack'];
  delete errorPropValue['type'];
  return _chalk.default.redBright(NEWLINE + NEWLINE + `🚨 ${errorType} Info` + NEWLINE + NEWLINE + (0, _stringify.default)(errorPropValue, null, 2) + NEWLINE);
};
exports.formatErrorProp = formatErrorProp;
const formatLevel = level => {
  const emoji = emojiLog[level];
  const padding = isWideEmoji(emoji) ? '' : ' ';
  return emoji + padding;
};
exports.formatLevel = formatLevel;
const formatLoadTime = elapsedTime => {
  const elapsed = (0, _parseInt2.default)(elapsedTime, 10);
  const time = (0, _prettyMs.default)(elapsed);
  return _chalk.default.gray(time);
};
exports.formatLoadTime = formatLoadTime;
const formatMessage = logData => {
  const {
    level,
    message
  } = logData;
  const msg = formatMessageName(message);
  let pretty;
  if (level === 'error') {
    pretty = _chalk.default.red(msg);
  }
  if (level === 'trace') {
    pretty = _chalk.default.white(msg);
  }
  if (level === 'warn') {
    pretty = _chalk.default.magenta(msg);
  }
  if (level === 'debug') {
    pretty = _chalk.default.yellow(msg);
  }
  if (level === 'info' || level === 'customlevel') {
    pretty = _chalk.default.green(msg);
  }
  if (level === 'fatal') {
    pretty = _chalk.default.white.bgRed(msg);
  }
  return pretty;
};
exports.formatMessage = formatMessage;
const formatMethod = method => {
  return method && _chalk.default.white(method);
};
exports.formatMethod = formatMethod;
const formatRequestId = requestId => {
  return requestId && _chalk.default.cyan(requestId);
};
exports.formatRequestId = formatRequestId;
const formatNs = ns => {
  return ns && _chalk.default.cyan(ns);
};
exports.formatNs = formatNs;
const formatName = name => {
  return name && _chalk.default.blue(name);
};
exports.formatName = formatName;
const formatMessageName = message => {
  if (message === undefined) {
    return '';
  }
  if (message === 'request') {
    return '<--';
  }
  if (message === 'response') {
    return '-->';
  }
  return message;
};
exports.formatMessageName = formatMessageName;
const formatOperationName = operationName => {
  return _chalk.default.white(NEWLINE + '🏷  ' + operationName);
};
exports.formatOperationName = formatOperationName;
const formatQuery = query => {
  if (!isEmptyObject(query)) {
    return _chalk.default.white(NEWLINE + '🔭 Query' + NEWLINE + (0, _stringify.default)(query, null, 2));
  }
  return;
};
exports.formatQuery = formatQuery;
const formatResponseCache = responseCache => {
  if (!isEmptyObject(responseCache)) {
    return _chalk.default.white(NEWLINE + '💾 Response Cache' + NEWLINE + (0, _stringify.default)(responseCache, null, 2));
  }
  return;
};
exports.formatResponseCache = formatResponseCache;
const formatStatusCode = statusCode => {
  statusCode = statusCode || 'xxx';
  return _chalk.default.white(statusCode);
};
exports.formatStatusCode = formatStatusCode;
const formatStack = stack => {
  return _chalk.default.redBright(stack ? NEWLINE + '🥞 Error Stack' + NEWLINE + NEWLINE + stack + NEWLINE : '');
};
exports.formatStack = formatStack;
const formatTracing = data => {
  if (!isEmptyObject(data)) {
    return _chalk.default.white(NEWLINE + '⏰ Timing' + NEWLINE + (0, _stringify.default)(data, null, 2));
  }
  return;
};
exports.formatTracing = formatTracing;
const formatUrl = url => {
  return _chalk.default.white(url);
};
exports.formatUrl = formatUrl;
const formatUserAgent = userAgent => {
  return _chalk.default.grey(NEWLINE + '🕵️‍♀️ ' + userAgent);
};
exports.formatUserAgent = formatUserAgent;
const noEmpty = value => {
  return !!value;
};
exports.noEmpty = noEmpty;