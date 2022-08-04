"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.LogFormatter = void 0;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _padStart = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/pad-start"));

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
  return object && !(0, _keys.default)(object).length;
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
    var _context;

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

    output.push(formatDate(logData.time || (0, _now.default)()));
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

    const err = (logData.level === 'fatal' || logData.level === 'error') && logData.err && (0, _find.default)(_context = (0, _keys.default)(logData.err)).call(_context, key => key !== 'stack') ? logData.err : null;

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

    return (0, _filter.default)(output).call(output, noEmpty).join(' ');
  };

  const formatBundleSize = bundle => {
    const bytes = (0, _parseInt2.default)(bundle, 10);
    const size = (0, _prettyBytes.default)(bytes).replace(/ /, '');
    return _chalk.default.gray(size);
  };

  const formatCustom = query => {
    if (!isEmptyObject(query)) {
      return _chalk.default.white(newline + '🗒 Custom' + newline + (0, _stringify.default)(query, null, 2));
    }

    return;
  };

  const formatData = data => {
    if (!isEmptyObject(data)) {
      return _chalk.default.white(newline + '📦 Result Data' + newline + (0, _stringify.default)(data, null, 2));
    }

    return;
  };

  const formatDate = instant => {
    var _context2, _context3, _context4;

    const date = new Date(instant);
    const hours = (0, _padStart.default)(_context2 = date.getHours().toString()).call(_context2, 2, '0');
    const minutes = (0, _padStart.default)(_context3 = date.getMinutes().toString()).call(_context3, 2, '0');
    const seconds = (0, _padStart.default)(_context4 = date.getSeconds().toString()).call(_context4, 2, '0');
    const prettyDate = hours + ':' + minutes + ':' + seconds;
    return _chalk.default.gray(prettyDate);
  };

  const formatErrorProp = errorPropValue => {
    const errorType = errorPropValue['type'] || 'Error';
    delete errorPropValue['message'];
    delete errorPropValue['stack'];
    delete errorPropValue['type'];
    return _chalk.default.redBright(newline + newline + `🚨 ${errorType} Info` + newline + newline + (0, _stringify.default)(errorPropValue, null, 2) + newline);
  };

  const formatLevel = level => {
    const emoji = emojiLog[level];
    const padding = isWideEmoji(emoji) ? '' : ' ';
    return emoji + padding;
  };

  const formatLoadTime = elapsedTime => {
    const elapsed = (0, _parseInt2.default)(elapsedTime, 10);
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
      return _chalk.default.white(newline + '🔭 Query' + newline + (0, _stringify.default)(query, null, 2));
    }

    return;
  };

  const formatResponseCache = responseCache => {
    if (!isEmptyObject(responseCache)) {
      return _chalk.default.white(newline + '💾 Response Cache' + newline + (0, _stringify.default)(responseCache, null, 2));
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
      return _chalk.default.white(newline + '⏰ Timing' + newline + (0, _stringify.default)(data, null, 2));
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