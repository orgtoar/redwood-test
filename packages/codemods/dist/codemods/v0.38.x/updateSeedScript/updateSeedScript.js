"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateSeedScript = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _crossUndiciFetch = require("cross-undici-fetch");

var _getRootPackageJSON = _interopRequireDefault(require("../../../lib/getRootPackageJSON"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

var _isTSProject = _interopRequireDefault(require("../../../lib/isTSProject"));

var _ts2js = _interopRequireDefault(require("../../../lib/ts2js"));

const updateSeedScript = async () => {
  /**
   * Add
   *
   * ```json
   * "prisma": {
   *   "seed": "yarn rw exec seed"
   * }
   * ```
   *
   * to root package.json.
   */
  const [rootPackageJSON, rootPackageJSONPath] = (0, _getRootPackageJSON.default)();
  rootPackageJSON.prisma = {
    seed: 'yarn rw exec seed'
  };

  _fs.default.writeFileSync(rootPackageJSONPath, JSON.stringify(rootPackageJSON, null, 2) + '\n');
  /**
   * Add `scripts/seed.{js,ts}` template.
   */


  const rwPaths = (0, _getRWPaths.default)();

  const hasScripts = _fs.default.existsSync(rwPaths.scripts);

  if (!hasScripts) {
    _fs.default.mkdirSync(rwPaths.scripts);
  }

  const res = await (0, _crossUndiciFetch.fetch)('https://raw.githubusercontent.com/redwoodjs/redwood/main/packages/create-redwood-app/template/scripts/seed.ts');
  let text = await res.text();

  if (!_isTSProject.default) {
    text = await (0, _ts2js.default)(text);
  }

  _fs.default.writeFileSync(_path.default.join(rwPaths.scripts, `seed.${_isTSProject.default ? 'ts' : 'js'}`), text ? text : '');
};

exports.updateSeedScript = updateSeedScript;