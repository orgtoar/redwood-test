"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.aliases = void 0;

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
  } = await Promise.resolve().then(() => _interopRequireWildcard(require('@redwoodjs/structure')));
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