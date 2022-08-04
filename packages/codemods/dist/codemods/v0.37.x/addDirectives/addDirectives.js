"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addDirectives = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _crossUndiciFetch = require("cross-undici-fetch");

var _fastGlob = _interopRequireDefault(require("fast-glob"));

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

const addDirectives = async () => {
  const rwPaths = (0, _getRWPaths.default)();
  /**
   * An object where the keys are resolved filenames and the values are (for the most part) URLs to fetch.
   *
   * @remarks
   *
   * Without the brackets areound requireAuthDir and skipAuthDir,
   * the key would just be 'requireAuthDir' and 'skipAuthDir' instead of their values.
   */

  const requireAuthDir = _path.default.join(rwPaths.api.directives, 'requireAuth');

  const skipAuthDir = _path.default.join(rwPaths.api.directives, 'skipAuth');

  const dirs = {
    [requireAuthDir]: {
      [_path.default.join(requireAuthDir, 'requireAuth')]: 'https://raw.githubusercontent.com/redwoodjs/redwood/main/packages/create-redwood-app/template/api/src/directives/requireAuth/requireAuth.ts',
      [_path.default.join(requireAuthDir, 'requireAuth.test')]: 'https://raw.githubusercontent.com/redwoodjs/redwood/main/packages/create-redwood-app/template/api/src/directives/requireAuth/requireAuth.test.ts'
    },
    [skipAuthDir]: {
      [_path.default.join(skipAuthDir, 'skipAuth')]: 'https://raw.githubusercontent.com/redwoodjs/redwood/main/packages/create-redwood-app/template/api/src/directives/skipAuth/skipAuth.ts',
      [_path.default.join(skipAuthDir, 'skipAuth.test')]: 'https://raw.githubusercontent.com/redwoodjs/redwood/main/packages/create-redwood-app/template/api/src/directives/skipAuth/skipAuth.test.ts'
    }
  };
  /**
   * Now we just mkdirs and fetch files.
   */

  _fs.default.mkdirSync(rwPaths.api.directives);

  for (const [dir, filenamesToUrls] of Object.entries(dirs)) {
    _fs.default.mkdirSync(dir);

    const isTSProject = _fastGlob.default.sync('api/tsconfig.json').length > 0 || _fastGlob.default.sync('web/tsconfig.json').length > 0;

    for (const [filename, url] of Object.entries(filenamesToUrls)) {
      const res = await (0, _crossUndiciFetch.fetch)(url);
      const text = await res.text();

      _fs.default.writeFileSync(`${filename}.${isTSProject ? 'ts' : 'js'}`, text);
    }
  }
};

exports.addDirectives = addDirectives;