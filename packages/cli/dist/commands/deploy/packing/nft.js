"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.generateEntryFile = generateEntryFile;
exports.nftPack = nftPack;
exports.packageSingleFunction = packageSingleFunction;
exports.zipDirectory = zipDirectory;
require("core-js/modules/es.array.push.js");
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _path = _interopRequireDefault(require("path"));
var _nft = require("@vercel/nft");
var _archiver = _interopRequireDefault(require("archiver"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _files = require("@redwoodjs/internal/dist/files");
var _projectConfig = require("@redwoodjs/project-config");
const ZIPBALL_DIR = './api/dist/zipball';
function zipDirectory(source, out) {
  const archive = (0, _archiver.default)('zip', {
    zlib: {
      level: 5
    }
  });
  const stream = _fsExtra.default.createWriteStream(out);
  return new _promise.default((resolve, reject) => {
    archive.directory(source, false).on('error', err => reject(err)).pipe(stream);
    stream.on('close', () => resolve());
    archive.finalize();
  });
}

// returns a tuple of [filePath, fileContent]
function generateEntryFile(functionAbsolutePath, name) {
  const relativeImport = (0, _projectConfig.ensurePosixPath)(_path.default.relative((0, _projectConfig.getPaths)().base, functionAbsolutePath));
  return [`${ZIPBALL_DIR}/${name}/${name}.js`, `module.exports = require('./${relativeImport}')`];
}
async function packageSingleFunction(functionFile) {
  const {
    name: functionName
  } = _path.default.parse(functionFile);
  const {
    fileList: functionDependencyFileList
  } = await (0, _nft.nodeFileTrace)([functionFile]);
  const copyPromises = [];
  for (const singleDependencyPath of functionDependencyFileList) {
    copyPromises.push(_fsExtra.default.copy('./' + singleDependencyPath, `${ZIPBALL_DIR}/${functionName}/${singleDependencyPath}`));
  }
  const [entryFilePath, content] = generateEntryFile(functionFile, functionName);

  // This generates an "entry" file, that just proxies the actual
  // function that is nested in api/dist/
  const functionEntryPromise = _fsExtra.default.outputFile(entryFilePath, content);
  copyPromises.push(functionEntryPromise);
  await _promise.default.all(copyPromises);
  await exports.zipDirectory(`${ZIPBALL_DIR}/${functionName}`, `${ZIPBALL_DIR}/${functionName}.zip`);
  await _fsExtra.default.remove(`${ZIPBALL_DIR}/${functionName}`);
  return;
}
function nftPack() {
  const filesToBePacked = (0, _files.findApiDistFunctions)();
  return _promise.default.all((0, _map.default)(filesToBePacked).call(filesToBePacked, exports.packageSingleFunction));
}