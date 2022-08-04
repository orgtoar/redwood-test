"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateDevFatalErrorPage = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _crossUndiciFetch = require("cross-undici-fetch");

var _getRWPaths = _interopRequireDefault(require("../../../lib/getRWPaths"));

const updateDevFatalErrorPage = async () => {
  const rwPaths = (0, _getRWPaths.default)();
  /**
   * An object where the keys are resolved filenames and the values are (for the most part) URLs to fetch.
   *
   * @remarks
   *
   */

  const webFatalErrorPagesDir = _path.default.join(rwPaths.web.pages, 'FatalErrorPage');

  const dirs = {
    [webFatalErrorPagesDir]: {
      [_path.default.join(webFatalErrorPagesDir, 'FatalErrorPage')]: 'https://raw.githubusercontent.com/redwoodjs/redwood/main/packages/create-redwood-app/template/web/src/pages/FatalErrorPage/FatalErrorPage.tsx'
    }
  };
  /**
   * Now we just fetch and replace files
   */

  for (const [_dir, filenamesToUrls] of Object.entries(dirs)) {
    const isTSPage = _fs.default.existsSync(_path.default.join(webFatalErrorPagesDir, 'FatalErrorPage.tsx'));

    for (const [filename, url] of Object.entries(filenamesToUrls)) {
      const res = await (0, _crossUndiciFetch.fetch)(url);
      const text = await res.text();
      const newFatalErrorPage = `${filename}.${isTSPage ? 'tsx' : 'js'}`;

      _fs.default.writeFileSync(newFatalErrorPage, text);
    }
  }
};

exports.updateDevFatalErrorPage = updateDevFatalErrorPage;