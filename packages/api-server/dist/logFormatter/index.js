"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LogFormatter = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _fastJsonParse = _interopRequireDefault(require("fast-json-parse"));

var _prettyBytes = _interopRequireDefault(require("pretty-bytes"));

var _prettyMs = _interopRequireDefault(require("pretty-ms"));

const newline = '\n';
const emojiLog = {
  warn: '🚦',
  info: '🌲',
  error: '🚨',
  debug: '🐛',
  fatal: '💀',
  trace: '🧵'
};

const isObject = input => {
  return Object.prototype.toString.apply(input) === '[object Object]';
};

const isEmptyObject = object => {
  return object && !Object.keys(object).length;
};

const isPinoLog = log => {
  return log && Object.prototype.hasOwnProperty.call(log, 'level');
};

const isWideEmoji = character => {
  return character !== '🚦';
};

const LogFormatter = () => {
  const parse = inputData => {
    let logData;

    if (typeof inputData === 'string') {
      const parsedData = (0, _fastJsonParse.default)(inputData);

      if (!parsedData.value || parsedData.err || !isPinoLog(parsedData.value)) {
        return inputData + newline;
      }

      logData = parsedData.value;
    } else if (isObject(inputData) && isPinoLog(inputData)) {
      logData = inputData;
    } else {
      return inputData + newline;
    }

    if (!logData.level) {
      return inputData + newline;
    }

    if (!logData.message) {
      logData.message = logData.msg;
    }

    if (typeof logData.level === 'number') {
      convertLogNumber(logData);
    }

    return output(logData) + newline;
  };

  const convertLogNumber = logData => {
    if (logData.level === 10) {
      logData.level = 'trace';
    }

    if (logData.level === 20) {
      logData.level = 'debug';
    }

    if (logData.level === 30) {
      logData.level = 'info';
    }

    if (logData.level === 40) {
      logData.level = 'warn';
    }

    if (logData.level === 50) {
      logData.level = 'error';
    }

    if (logData.level === 60) {
      logData.level = 'fatal';
    }
  };

  const output = logData => {
    const output = [];

    if (!logData.level) {
      logData.level = 'customlevel';
    }

    if (!logData.name) {
      logData.name = '';
    }

    if (!logData.ns) {
      logData.ns = '';
    }

    output.push(formatDate(logData.time || Date.now()));
    output.push(formatLevel(logData.level));
    output.push(formatNs(logData.ns));
    output.push(formatName(logData.name));
    output.push(formatRequestId(logData.requestId));
    output.push(formatMessage(logData));
    const req = logData.req;
    const res = logData.res;
    const statusCode = res ? res.statusCode : logData.statusCode;
    const responseTime = logData.responseTime || logData.elapsed;
    const method = req ? req.method : logData.method;
    const custom = logData.custom;
    const contentLength = logData.contentLength;
    const operationName = logData.operationName;
    const query = logData.query;
    const graphQLData = logData.data;
    const responseCache = logData.responseCache;
    const tracing = logData.tracing;
    const url = req ? req.url : logData.url;
    const userAgent = logData.userAgent;
    const stack = logData.level === 'fatal' || logData.level === 'error' ? logData.stack || logData.err && logData.err.stack : null; // Output err if it has more keys than 'stack'

    const err = (logData.level === 'fatal' || logData.level === 'error') && logData.err && Object.keys(logData.err).find(key => key !== 'stack') ? logData.err : null;

    if (method != null) {
      output.push(formatMethod(method));
      output.push(formatStatusCode(statusCode));
    }

    if (url != null) {
      output.push(formatUrl(url));
    }

    if (contentLength != null) {
      output.push(formatBundleSize(contentLength));
    }

    if (custom) {
      output.push(formatCustom(custom));
    }

    if (responseTime != null) {
      output.push(formatLoadTime(responseTime));
    }

    if (userAgent != null) {
      output.push(formatUserAgent(userAgent));
    }

    if (operationName != null) {
      output.push(formatOperationName(operationName));
    }

    if (query != null) {
      output.push(formatQuery(query));
    }

    if (graphQLData != null) {
      output.push(formatData(graphQLData));
    }

    if (responseCache != null) {
      output.push(formatResponseCache(responseCache));
    }

    if (tracing != null) {
      output.push(formatTracing(tracing));
    }

    if (err != null) {
      output.push(formatErrorProp(err));
    }

    if (stack != null) {
      output.push(formatStack(stack));
    }

    return output.filter(noEmpty).join(' ');
  };

  const formatBundleSize = bundle => {
    const bytes = parseInt(bundle, 10);
    const size = (0, _prettyBytes.default)(bytes).replace(/ /, '');
    return _chalk.default.gray(size);
  };

  const formatCustom = query => {
    if (!isEmptyObject(query)) {
      return _chalk.default.white(newline + '🗒 Custom' + newline + JSON.stringify(query, null, 2));
    }

    return;
  };

  const formatData = data => {
    if (!isEmptyObject(data)) {
      return _chalk.default.white(newline + '📦 Result Data' + newline + JSON.stringify(data, null, 2));
    }

    return;
  };

  const formatDate = instant => {
    const date = new Date(instant);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const prettyDate = hours + ':' + minutes + ':' + seconds;
    return _chalk.default.gray(prettyDate);
  };

  const formatErrorProp = errorPropValue => {
    const errorType = errorPropValue['type'] || 'Error';
    delete errorPropValue['message'];
    delete errorPropValue['stack'];
    delete errorPropValue['type'];
    return _chalk.default.redBright(newline + newline + `🚨 ${errorType} Info` + newline + newline + JSON.stringify(errorPropValue, null, 2) + newline);
  };

  const formatLevel = level => {
    const emoji = emojiLog[level];
    const padding = isWideEmoji(emoji) ? '' : ' ';
    return emoji + padding;
  };

  const formatLoadTime = elapsedTime => {
    const elapsed = parseInt(elapsedTime, 10);
    const time = (0, _prettyMs.default)(elapsed);
    return _chalk.default.gray(time);
  };

  const formatMessage = logData => {
    const msg = formatMessageName(logData.message);
    let pretty;

    if (logData.level === 'error') {
      pretty = _chalk.default.red(msg);
    }

    if (logData.level === 'trace') {
      pretty = _chalk.default.white(msg);
    }

    if (logData.level === 'warn') {
      pretty = _chalk.default.magenta(msg);
    }

    if (logData.level === 'debug') {
      pretty = _chalk.default.yellow(msg);
    }

    if (logData.level === 'info' || logData.level === 'customlevel') {
      pretty = _chalk.default.green(msg);
    }

    if (logData.level === 'fatal') {
      pretty = _chalk.default.white.bgRed(msg);
    }

    return pretty;
  };

  const formatMethod = method => {
    return _chalk.default.white(method);
  };

  const formatRequestId = requestId => {
    return requestId && _chalk.default.cyan(requestId);
  };

  const formatNs = name => {
    return _chalk.default.cyan(name);
  };

  const formatName = name => {
    return _chalk.default.blue(name);
  };

  const formatMessageName = message => {
    if (message === 'request') {
      return '<--';
    }

    if (message === 'response') {
      return '-->';
    }

    return message;
  };

  const formatOperationName = operationName => {
    return _chalk.default.white(newline + '🏷  ' + operationName);
  };

  const formatQuery = query => {
    if (!isEmptyObject(query)) {
      return _chalk.default.white(newline + '🔭 Query' + newline + JSON.stringify(query, null, 2));
    }

    return;
  };

  const formatResponseCache = responseCache => {
    if (!isEmptyObject(responseCache)) {
      return _chalk.default.white(newline + '💾 Response Cache' + newline + JSON.stringify(responseCache, null, 2));
    }

    return;
  };

  const formatStatusCode = statusCode => {
    statusCode = statusCode || 'xxx';
    return _chalk.default.white(statusCode);
  };

  const formatStack = stack => {
    return _chalk.default.redBright(stack ? newline + '🥞 Error Stack' + newline + newline + stack + newline : '');
  };

  const formatTracing = data => {
    if (!isEmptyObject(data)) {
      return _chalk.default.white(newline + '⏰ Timing' + newline + JSON.stringify(data, null, 2));
    }

    return;
  };

  const formatUrl = url => {
    return _chalk.default.white(url);
  };

  const formatUserAgent = userAgent => {
    return _chalk.default.grey(newline + '🕵️‍♀️ ' + userAgent);
  };

  const noEmpty = value => {
    return !!value;
  };

  return parse;
};

exports.LogFormatter = LogFormatter;