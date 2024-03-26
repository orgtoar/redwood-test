"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extendStorybookConfiguration;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _prettier = _interopRequireDefault(require("prettier"));
var _merge = require("./merge");
var _strategy = require("./merge/strategy");
var _project = require("./project");
var _ = require(".");
/**
 * Extends the Storybook configuration file with the new configuration file
 * @param {string} newConfigPath - The path to the new configuration file
 */
async function extendStorybookConfiguration(newConfigPath = undefined) {
  const webPaths = (0, _.getPaths)().web;
  const ts = (0, _project.isTypeScriptProject)();
  const sbPreviewConfigPath = webPaths.storybookPreviewConfig ?? `${webPaths.config}/storybook.preview.${ts ? 'tsx' : 'js'}`;
  const read = path => _fsExtra.default.readFileSync(path, {
    encoding: 'utf-8'
  });
  if (!_fsExtra.default.existsSync(sbPreviewConfigPath)) {
    // If the Storybook preview config file doesn't exist, create it from the template
    const templateContent = read(_path.default.resolve(__dirname, 'templates', 'storybook.preview.tsx.template'));
    const storybookPreviewContent = ts ? templateContent : (0, _.transformTSToJS)(sbPreviewConfigPath, templateContent);
    await (0, _.writeFile)(sbPreviewConfigPath, storybookPreviewContent);
  }
  const storybookPreviewContent = read(sbPreviewConfigPath);
  if (newConfigPath) {
    // If the new config file path is provided, merge it with the Storybook preview config file
    const newConfigTemplate = read(newConfigPath);
    const newConfigContent = ts ? newConfigTemplate : (0, _.transformTSToJS)(newConfigPath, newConfigTemplate);
    const merged = (0, _merge.merge)(storybookPreviewContent, newConfigContent, {
      ImportDeclaration: _strategy.interleave,
      ArrayExpression: _strategy.concatUnique,
      ObjectExpression: _strategy.concatUnique,
      ArrowFunctionExpression: _strategy.keepBothStatementParents,
      FunctionDeclaration: _strategy.keepBoth
    });
    const formatted = _prettier.default.format(merged, {
      parser: 'babel',
      ...(await _prettier.default.resolveConfig(sbPreviewConfigPath))
    });
    (0, _.writeFile)(sbPreviewConfigPath, formatted, {
      overwriteExisting: true
    });
  }
}