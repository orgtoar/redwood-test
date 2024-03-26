"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.aliases = void 0;
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../lib");
var _colors = _interopRequireDefault(require("../lib/colors"));
const command = exports.command = 'check';
const aliases = exports.aliases = ['diagnostics'];
const description = exports.description = 'Get structural diagnostics for a Redwood project (experimental)';
const handler = () => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'check'
  });
  // Deep dive
  //
  // It seems like we have to use `require` here instead of `await import`
  // because of how Babel builds the `DiagnosticSeverity` export in `@redwoodjs/structure`:
  //
  // ```js
  // _Object$defineProperty(exports, "DiagnosticSeverity", {
  //   enumerable: true,
  //   get: function () {
  //     return _vscodeLanguageserverTypes.DiagnosticSeverity;
  //   }
  // });
  // ```
  //
  // I'm not sure why, but with `await import`, `DiagnosticSeverity` is `undefined`
  // so it seems like `await import` doesn't execute the getter function.
  const {
    printDiagnostics,
    DiagnosticSeverity
  } = require('@redwoodjs/structure');
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