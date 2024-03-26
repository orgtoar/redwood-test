"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.loadDefaultEnvFiles = loadDefaultEnvFiles;
exports.loadEnvFiles = loadEnvFiles;
exports.loadNodeEnvDerivedEnvFile = loadNodeEnvDerivedEnvFile;
exports.loadUserSpecifiedEnvFiles = loadUserSpecifiedEnvFiles;
var _path = _interopRequireDefault(require("path"));
var _dotenv = require("dotenv");
var _dotenvDefaults = require("dotenv-defaults");
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _helpers = require("yargs/helpers");
var _projectConfig = require("@redwoodjs/project-config");
// @ts-check

function loadEnvFiles() {
  if (process.env.REDWOOD_ENV_FILES_LOADED) {
    return;
  }
  const {
    base
  } = (0, _projectConfig.getPaths)();
  loadDefaultEnvFiles(base);
  loadNodeEnvDerivedEnvFile(base);
  const {
    loadEnvFiles
  } = (0, _helpers.Parser)((0, _helpers.hideBin)(process.argv), {
    array: ['load-env-files'],
    default: {
      loadEnvFiles: []
    }
  });
  if (loadEnvFiles.length > 0) {
    loadUserSpecifiedEnvFiles(base, loadEnvFiles);
  }
  process.env.REDWOOD_ENV_FILES_LOADED = 'true';
}

/**
 * @param {string} cwd
 */
function loadDefaultEnvFiles(cwd) {
  (0, _dotenvDefaults.config)({
    path: _path.default.join(cwd, '.env'),
    defaults: _path.default.join(cwd, '.env.defaults'),
    multiline: true
  });
}

/**
 * @param {string} cwd
 */
function loadNodeEnvDerivedEnvFile(cwd) {
  if (!process.env.NODE_ENV) {
    return;
  }
  const nodeEnvDerivedEnvFilePath = _path.default.join(cwd, `.env.${process.env.NODE_ENV}`);
  if (!_fsExtra.default.existsSync(nodeEnvDerivedEnvFilePath)) {
    return;
  }
  (0, _dotenv.config)({
    path: nodeEnvDerivedEnvFilePath,
    override: true
  });
}

/**
 * @param {string} cwd
 */
function loadUserSpecifiedEnvFiles(cwd, loadEnvFiles) {
  for (const suffix of loadEnvFiles) {
    const envPath = _path.default.join(cwd, `.env.${suffix}`);
    if (!_fsExtra.default.pathExistsSync(envPath)) {
      throw new Error(`Couldn't find an .env file at '${envPath}' as specified by '--load-env-files'`);
    }
    (0, _dotenv.config)({
      path: envPath,
      override: true
    });
  }
}