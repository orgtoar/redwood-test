"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process_env_findAll = process_env_findAll;
exports.process_env_findInFile = process_env_findInFile;
exports.process_env_findInFile2 = process_env_findInFile2;

var _path = require("path");

var _fsExtra = require("fs-extra");

var _glob = _interopRequireDefault(require("glob"));

var tsm = _interopRequireWildcard(require("ts-morph"));

var _Array = require("../../x/Array");

var _tsMorph2 = require("../../x/ts-morph");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function process_env_findAll(dir) {
  return (0, _Array.iter)(function* () {
    for (const file of _glob.default.sync((0, _path.join)(dir, 'src/**/*.{js,ts,jsx,tsx}'))) {
      yield* process_env_findInFile(file, (0, _fsExtra.readFileSync)(file).toString());
    }
  });
}

function process_env_findInFile(filePath, text) {
  if (!text.includes('process.env')) {
    return [];
  }

  try {
    return process_env_findInFile2((0, _tsMorph2.createTSMSourceFile_cached)(filePath, text));
  } catch (e) {
    return [];
  }
}

function process_env_findInFile2(sf) {
  const penvs = sf.getDescendantsOfKind(tsm.SyntaxKind.PropertyAccessExpression).filter(is_process_env);
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