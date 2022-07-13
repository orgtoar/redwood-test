"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.prisma_parseEnvExpressions = prisma_parseEnvExpressions;
exports.prisma_parseEnvExpressionsInFile = prisma_parseEnvExpressionsInFile;

var _matchAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/match-all"));

var _fsExtra = require("fs-extra");

var _vscodeLanguageserver = require("vscode-languageserver");

var _URL = require("./URL");

var _vscodeLanguageserverTypes = require("./vscode-languageserver-types");

/**
 * find "env()" expressions in a prisma file using regex
 * @param prismaSchemaFilePath
 */
function* prisma_parseEnvExpressionsInFile(prismaSchemaFilePath) {
  const uri = (0, _URL.URL_file)(prismaSchemaFilePath);
  const file = (0, _URL.URL_toFile)(uri); // convert back and forth in case someone passed a uri

  if (!(0, _fsExtra.existsSync)(file)) {
    return [];
  } // fail silently


  const src = (0, _fsExtra.readFileSync)(file).toString();
  const exprs = prisma_parseEnvExpressions(src);

  for (const {
    range,
    key
  } of exprs) {
    const location = {
      uri,
      range
    };
    yield {
      location,
      key
    };
  }
}
/**
 * find "env()" expressions in a prisma file using regex
 * @param src
 */


function* prisma_parseEnvExpressions(src) {
  const re = /env\(([^)]+)\)/gm;

  for (const match of (0, _matchAll.default)(_context = src).call(_context, re)) {
    var _context;

    try {
      const start = (0, _vscodeLanguageserverTypes.Position_fromOffsetOrFail)(match.index, src);
      const end = (0, _vscodeLanguageserverTypes.Position_fromOffsetOrFail)(match.index + match[0].length, src);

      const range = _vscodeLanguageserver.Range.create(start, end);

      const key = JSON.parse(match[1]);
      yield {
        range,
        key
      };
    } catch (e) {// we don't care about malformed env() calls
      // that should be picked up by the prisma parser
    }
  }
}