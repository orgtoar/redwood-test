"use strict";

var _Object$defineProperty2 = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty2(exports, "__esModule", {
  value: true
});
exports.CustomFileExporter = void 0;
var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/define-property"));
var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _classPrivateFieldLooseBase2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classPrivateFieldLooseBase"));
var _classPrivateFieldLooseKey2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classPrivateFieldLooseKey"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _projectConfig = require("@redwoodjs/project-config");
/**
 * Custom exporter which writes spans to a file inside of .redwood/spans
 */
var _storageFileName = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("storageFileName");
var _storageFilePath = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("storageFilePath");
var _isShutdown = /*#__PURE__*/(0, _classPrivateFieldLooseKey2.default)("isShutdown");
class CustomFileExporter {
  constructor() {
    /**
     * @type string
     * @private
     */
    (0, _defineProperty.default)(this, _storageFileName, {
      writable: true,
      value: void 0
    });
    /**
     * @type string
     * @private
     */
    (0, _defineProperty.default)(this, _storageFilePath, {
      writable: true,
      value: void 0
    });
    /**
     * @type boolean
     * @private
     */
    (0, _defineProperty.default)(this, _isShutdown, {
      writable: true,
      value: false
    });
    (0, _classPrivateFieldLooseBase2.default)(this, _storageFileName)[_storageFileName] = `${(0, _now.default)()}.json`;

    // Ensure the path exists
    (0, _classPrivateFieldLooseBase2.default)(this, _storageFilePath)[_storageFilePath] = _path.default.join((0, _projectConfig.getPaths)().generated.base, 'telemetry', (0, _classPrivateFieldLooseBase2.default)(this, _storageFileName)[_storageFileName]);
    _fsExtra.default.ensureDirSync(_path.default.dirname((0, _classPrivateFieldLooseBase2.default)(this, _storageFilePath)[_storageFilePath]));

    // Create the file and open a JSON array
    _fsExtra.default.writeFileSync((0, _classPrivateFieldLooseBase2.default)(this, _storageFilePath)[_storageFilePath], '[');
  }

  /**
   * Called to export sampled {@link ReadableSpan}s.
   * @param spans the list of sampled Spans to be exported.
   */
  export(spans, resultCallback) {
    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      delete span['_spanProcessor']; // This is a circular reference and will cause issues with JSON.stringify
      _fsExtra.default.appendFileSync((0, _classPrivateFieldLooseBase2.default)(this, _storageFilePath)[_storageFilePath], (0, _stringify.default)(span, undefined, 2));
      _fsExtra.default.appendFileSync((0, _classPrivateFieldLooseBase2.default)(this, _storageFilePath)[_storageFilePath], ',');
    }
    resultCallback({
      code: 0
    });
  }

  /** Stops the exporter. */
  shutdown() {
    // Close the JSON array
    if (!(0, _classPrivateFieldLooseBase2.default)(this, _isShutdown)[_isShutdown]) {
      // Remove the trailing comma
      _fsExtra.default.truncateSync((0, _classPrivateFieldLooseBase2.default)(this, _storageFilePath)[_storageFilePath], _fsExtra.default.statSync((0, _classPrivateFieldLooseBase2.default)(this, _storageFilePath)[_storageFilePath]).size - 1);
      _fsExtra.default.appendFileSync((0, _classPrivateFieldLooseBase2.default)(this, _storageFilePath)[_storageFilePath], ']');
      (0, _classPrivateFieldLooseBase2.default)(this, _isShutdown)[_isShutdown] = true;
    }
  }

  /** Immediately export all spans */
  forceFlush() {
    // Do nothing
  }
}
exports.CustomFileExporter = CustomFileExporter;