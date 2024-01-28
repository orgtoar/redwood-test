"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.LogFormatter = void 0;
var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));
var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
require("core-js/modules/es.array.push.js");
var _fastJsonParse = _interopRequireDefault(require("fast-json-parse"));
var _formatters = require("./formatters");
const LogFormatter = () => {
  const parse = inputData => {
    let logData;
    if (typeof inputData === 'string') {
      const parsedData = (0, _fastJsonParse.default)(inputData);
      if (!parsedData.value || parsedData.err || !(0, _formatters.isPinoLog)(parsedData.value)) {
        return inputData + _formatters.NEWLINE;
      }
      logData = parsedData.value;
    } else if ((0, _formatters.isObject)(inputData) && (0, _formatters.isPinoLog)(inputData)) {
      logData = inputData;
    } else {
      return inputData + _formatters.NEWLINE;
    }
    if (!logData.level) {
      return inputData + _formatters.NEWLINE;
    }
    if (!logData.message) {
      logData.message = logData.msg;
    }
    if (typeof logData.level === 'number') {
      convertLogNumber(logData);
    }
    return output(logData) + _formatters.NEWLINE;
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
    output.push((0, _formatters.formatDate)(logData.time || (0, _now.default)()));
    output.push((0, _formatters.formatLevel)(logData.level));
    output.push((0, _formatters.formatNs)(logData.ns));
    output.push((0, _formatters.formatName)(logData.name));
    output.push((0, _formatters.formatRequestId)(logData.requestId));
    output.push((0, _formatters.formatMessage)(logData));
    const req = logData.req;
    const res = logData.res;
    const {
      statusCode: responseStatusCode
    } = res || {};
    const {
      method: requestMethod,
      url: requestUrl
    } = req || {};
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
    const stack = level === 'fatal' || level === 'error' ? logDataStack || logDataErr && logDataErrStack : null;

    // Output err if it has more keys than 'stack'
    const err = (level === 'fatal' || level === 'error') && logDataErr && (0, _find.default)(_context = (0, _keys.default)(logDataErr)).call(_context, key => key !== 'stack') ? logDataErr : null;
    if (!message) {
      logData.message = '';
    }
    if (!level) {
      logData.level = 'customlevel';
    }
    if (!name) {
      logData.name = '';
    }
    if (!ns) {
      logData.ns = '';
    }
    if (method != null) {
      output.push((0, _formatters.formatMethod)(method));
      output.push((0, _formatters.formatStatusCode)(statusCode));
    }
    if (url != null) {
      output.push((0, _formatters.formatUrl)(url));
    }
    if (contentLength != null) {
      output.push((0, _formatters.formatBundleSize)(contentLength));
    }
    if (custom) {
      output.push((0, _formatters.formatCustom)(custom));
    }
    if (responseTime != null) {
      output.push((0, _formatters.formatLoadTime)(responseTime));
    }
    if (userAgent != null) {
      output.push((0, _formatters.formatUserAgent)(userAgent));
    }
    if (operationName != null) {
      output.push((0, _formatters.formatOperationName)(operationName));
    }
    if (query != null) {
      output.push((0, _formatters.formatQuery)(query));
    }
    if (graphQLData != null) {
      output.push((0, _formatters.formatData)(graphQLData));
    }
    if (responseCache != null) {
      output.push((0, _formatters.formatResponseCache)(responseCache));
    }
    if (tracing != null) {
      output.push((0, _formatters.formatTracing)(tracing));
    }
    if (err != null) {
      output.push((0, _formatters.formatErrorProp)(err));
    }
    if (stack != null) {
      output.push((0, _formatters.formatStack)(stack));
    }
    if (rest) {
      output.push((0, _formatters.formatCustom)(rest));
    }
    return (0, _filter.default)(output).call(output, _formatters.noEmpty).join(' ');
  };
  return parse;
};
exports.LogFormatter = LogFormatter;