"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.process_env_findAll = process_env_findAll;
exports.process_env_findInFile = process_env_findInFile;
exports.process_env_findInFile2 = process_env_findInFile2;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _path = require("path");

var _fsExtra = require("fs-extra");

var _glob = _interopRequireDefault(require("glob"));

var tsm = _interopRequireWildcard(require("ts-morph"));

var _Array = require("../../x/Array");

var _tsMorph2 = require("../../x/ts-morph");

function process_env_findAll(dir) {
  return (0, _Array.iter)(function* () {
    for (const file of _glob.default.sync((0, _path.join)(dir, 'src/**/*.{js,ts,jsx,tsx}'))) {
      yield* process_env_findInFile(file, (0, _fsExtra.readFileSync)(file).toString());
    }
  });
}

function process_env_findInFile(filePath, text) {
  if (!(0, _includes.default)(text).call(text, 'process.env')) {
    return [];
  }

  try {
    return process_env_findInFile2((0, _tsMorph2.createTSMSourceFile_cached)(filePath, text));
  } catch (e) {
    return [];
  }
}

function process_env_findInFile2(sf) {
  var _context;

  const penvs = (0, _filter.default)(_context = sf.getDescendantsOfKind(tsm.SyntaxKind.PropertyAccessExpression)).call(_context, is_process_env);
  return (0, _Array.iter)(function* () {
    for (const penv of penvs) {
      const node = penv.getParent();

      if (!node) {
        continue;
      }

      if (tsm.Node.isPropertyAccessExpression(node)) {
        yield {
          key: node.getName(),
          node
        };
      } else if (tsm.Node.isElementAccessExpression(node)) {
        const arg = node.getArgumentExpression();

        if (!arg) {
          continue;
        }

        if (!tsm.Node.isStringLiteral(arg)) {
          continue;
        }

        yield {
          key: arg.getLiteralText(),
          node
        };
      }
    }
  });
}

function is_process_env(n) {
  if (!tsm.Node.isPropertyAccessExpression(n)) {
    return false;
  }

  return n.getExpression().getText() === 'process' && n.getName() === 'env';
}