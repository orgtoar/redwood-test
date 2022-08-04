"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.aliases = void 0;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

const command = 'check';
exports.command = command;
const aliases = ['diagnostics'];
exports.aliases = aliases;
const description = 'Get structural diagnostics for a Redwood project (experimental)';
exports.description = description;

const handler = async () => {
  const {
    printDiagnostics,
    DiagnosticSeverity
  } = await _promise.default.resolve().then(() => (0, _interopRequireWildcard2.default)(require('@redwoodjs/structure')));
  printDiagnostics((0, _lib.getPaths)().base, {
    getSeverityLabel: severity => {
      if (severity === DiagnosticSeverity.Error) {
        return _colors.default.error('error');
      }

      if (severity === DiagnosticSeverity.Warning) {
        return _colors.default.warning('warning');
      }

      return _colors.default.info('info');
    }
  });
};

exports.handler = handler;