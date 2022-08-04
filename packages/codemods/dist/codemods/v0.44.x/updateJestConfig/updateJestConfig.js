"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = updateJestConfig;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _fetchFileFromTemplate = _interopRequireDefault(require("../../../lib/fetchFileFromTemplate"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

var _runTransform = _interopRequireDefault(require("../../../lib/runTransform"));

/**
 * @typedef {[string, string, string]} JestConfigPaths
 */
async function updateJestConfig() {
  const rwPaths = (0, _getRWPaths.default)();
  /**
   * @type JestConfigPaths
   */

  const jestConfigPaths = [[rwPaths.base, 'jest.config.js'], [rwPaths.api.base, 'jest.config.js'], [rwPaths.web.base, 'jest.config.js']].map(paths => _path.default.join(...paths));
  const [rootJestConfigPath, ...apiWebJestConfigPaths] = jestConfigPaths;
  const tag = 'main';

  if (!_fs.default.existsSync(rootJestConfigPath)) {
    const rootJestConfigTemplate = await (0, _fetchFileFromTemplate.default)(tag, 'jest.config.js');

    _fs.default.writeFileSync(rootJestConfigPath, rootJestConfigTemplate);
  }

  for (const apiWebJestConfigPath of apiWebJestConfigPaths) {
    if (!_fs.default.existsSync(apiWebJestConfigPath)) {
      const {
        dir,
        base
      } = _path.default.parse(apiWebJestConfigPath);

      const file = _path.default.format({
        dir: _path.default.basename(dir),
        base
      });

      const apiWebJestConfigTemplate = await (0, _fetchFileFromTemplate.default)(tag, file);

      _fs.default.writeFileSync(apiWebJestConfigPath, apiWebJestConfigTemplate);
    } else {
      await (0, _runTransform.default)({
        transformPath: _path.default.join(__dirname, 'updateJestConfig.transform.js'),
        targetPaths: [apiWebJestConfigPath]
      });
    }
  }
}