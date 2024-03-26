"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.SHOW_LOCK_IDENTIFIER = exports.EXCLUDED_COMMANDS = exports.DEFAULT_DATETIME_MS = exports.CHECK_LOCK_IDENTIFIER = void 0;
exports.check = check;
exports.isEnabled = isEnabled;
exports.readUpdateDataFile = readUpdateDataFile;
exports.shouldCheck = shouldCheck;
exports.shouldShow = shouldShow;
exports.showUpdateMessage = showUpdateMessage;
exports.updateCheckMiddleware = updateCheckMiddleware;
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/map"));
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/entries"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _entries2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _fromEntries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/from-entries"));
var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/index-of"));
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
require("core-js/modules/esnext.json.parse.js");
var _path = _interopRequireDefault(require("path"));
var _boxen = _interopRequireDefault(require("boxen"));
var _chalk = _interopRequireDefault(require("chalk"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _latestVersion = _interopRequireDefault(require("latest-version"));
var _semver = _interopRequireDefault(require("semver"));
var _projectConfig = require("@redwoodjs/project-config");
var _background = require("./background");
var _locking = require("./locking");
var _index = require("./index");
/**
 * @typedef {{
 *   localVersion: string,
 *   remoteVersions: Map<string, string>,
 *   checkedAt: number,
 *   shownAt: number,
 * }} UpdateData
 */

/**
 * @const {number} The number of milliseconds between update checks (24 hours)
 */
const CHECK_PERIOD = 24 * 60 * 60_000;

/**
 * @const {number} The number of milliseconds between showing a user an update notification (24 hours)
 */
const SHOW_PERIOD = 24 * 60 * 60_000;

/**
 * @const {number} The default datetime for shownAt and checkedAt in milliseconds, corresponds to 2000-01-01T00:00:00.000Z
 */
const DEFAULT_DATETIME_MS = exports.DEFAULT_DATETIME_MS = 946684800000;

/**
 * @const {string} The identifier used for the lock within the check function
 */
const CHECK_LOCK_IDENTIFIER = exports.CHECK_LOCK_IDENTIFIER = 'UPDATE_CHECK';

/**
 * @const {string} The identifier used for the lock when showing an update message
 */
const SHOW_LOCK_IDENTIFIER = exports.SHOW_LOCK_IDENTIFIER = 'UPDATE_CHECK_SHOW';

/**
 * @const {string[]} The name of commands which should NOT execute the update checker
 */
const EXCLUDED_COMMANDS = exports.EXCLUDED_COMMANDS = ['upgrade', 'ts-to-js'];

/**
 * @const {string} Filepath of the file which persists update check data within the .redwood directory
 */
let persistenceDirectory;
function getPersistenceDirectory() {
  if (persistenceDirectory) {
    return persistenceDirectory;
  }
  persistenceDirectory = _path.default.join((0, _index.getPaths)().generated.base, 'updateCheck');
  return persistenceDirectory;
}

/**
 * Performs an update check to detect if a newer version of redwood is available and records the result to a file within .redwood for persistence
 */
async function check() {
  try {
    console.time('Update Check');

    // Read package.json and extract the @redwood/core version
    const packageJson = JSON.parse(_fsExtra.default.readFileSync(_path.default.join((0, _index.getPaths)().base, 'package.json')));
    let localVersion = packageJson.devDependencies['@redwoodjs/core'];

    // Remove any leading non-digits, i.e. ^ or ~
    while (!/\d/.test(localVersion.charAt(0))) {
      localVersion = localVersion.substring(1);
    }
    console.log(`Detected the current version of RedwoodJS: '${localVersion}'`);
    const remoteVersions = new _map.default();
    for (const tag of (0, _projectConfig.getConfig)().notifications.versionUpdates) {
      console.log(`Checking for new versions for npm tag: '${tag}'`);
      try {
        remoteVersions.set(tag, await (0, _latestVersion.default)('@redwoodjs/core', {
          version: tag
        }));
      } catch (error) {
        // This error may result as the ability of the user to specify arbitrary tags within their config file
        console.error(`Couldn't find a version for tag: '${tag}'`);
        console.error(error);
      }
    }
    console.log(`Detected the latest versions of RedwoodJS as:`);
    console.log((0, _stringify.default)([...(0, _entries.default)(remoteVersions).call(remoteVersions)], undefined, 2));

    // Save the latest update information
    console.log('Saving updated version information for future checks...');
    updateUpdateDataFile({
      localVersion,
      remoteVersions,
      checkedAt: new Date().getTime()
    });
  } finally {
    (0, _locking.unsetLock)(CHECK_LOCK_IDENTIFIER);
    console.timeEnd('Update Check');
  }
}

/**
 * Determines if background checks are enabled. Checks are enabled within the redwood.toml notifications config.
 */
function isEnabled() {
  return (0, _projectConfig.getConfig)().notifications.versionUpdates.length > 0;
}

/**
 * Determines if an update check is due based on if enough time has elapsed since the last check
 * @return {boolean} `true` if an update check is overdue
 * @see {@link CHECK_PERIOD} for the time between notifications
 */
function shouldCheck() {
  // We don't want to check if a different process is already checking
  if ((0, _locking.isLockSet)(CHECK_LOCK_IDENTIFIER)) {
    return false;
  }

  // Check if we haven't checked recently
  const data = readUpdateDataFile();
  return data.checkedAt < new Date().getTime() - CHECK_PERIOD;
}

/**
 * Determines if the user should see an update notification based on if a new version is available and enough time has elapsed since the last notification
 * @return {boolean} `true` if the user should see an update notification
 * @see {@link SHOW_PERIOD} for the time between notifications
 */
function shouldShow() {
  var _context;
  // We don't want to show if a different process is already about to
  if ((0, _locking.isLockSet)(SHOW_LOCK_IDENTIFIER)) {
    return false;
  }

  // Check there is a new version and we haven't shown the user recently
  const data = readUpdateDataFile();
  let newerVersion = false;
  (0, _forEach.default)(_context = data.remoteVersions).call(_context, version => {
    newerVersion ||= _semver.default.gt(version, data.localVersion);
  });
  return data.shownAt < new Date().getTime() - SHOW_PERIOD && newerVersion;
}

/**
 * Prints the update notification message to the console and updates the stored shownAt property
 * @see {@link getUpdateMessage} for the definition of the string which is printed
 */
function showUpdateMessage() {
  console.log(getUpdateMessage());
  updateUpdateDataFile({
    shownAt: new Date().getTime()
  });
}

/**
 * Returns a nicely formatted string containing an update notification
 * @return {string} A specifically formatted update notification message
 */
function getUpdateMessage() {
  var _context2;
  const data = readUpdateDataFile();

  // Whatever tag the user is currently on or 'latest'
  const localTag = extractTagFromVersion(data.localVersion) || 'latest';
  let updateCount = 0;
  let message = ' New updates to Redwood are available via `yarn rw upgrade#REPLACEME#` ';
  (0, _forEach.default)(_context2 = data.remoteVersions).call(_context2, (version, tag) => {
    if (_semver.default.gt(version, data.localVersion)) {
      updateCount += 1;
      if (tag === localTag) {
        message += `\n\n ❖  ${_chalk.default.underline(_chalk.default.bold(tag))}:\n     v${data.localVersion} -> v${version} `;
      } else {
        message += `\n\n ❖  ${tag}:\n     v${version} `;
      }
    }
  });
  message += '\n\n See release notes at: https://github.com/redwoodjs/redwood/releases ';
  message = message.replace('#REPLACEME#', updateCount > 1 ? ' -t [tag]' : '');
  return (0, _boxen.default)(message, {
    padding: 0,
    margin: 1,
    title: `Redwood Update${updateCount > 1 ? 's ' : ' '}available 🎉`,
    borderColor: '#0b8379',
    // The RedwoodJS colour
    borderStyle: 'round'
  });
}

/**
 * Reads update data from a file within .redwood
 * @return {UpdateData} The update data object containing the localVersion, remoteVersion, checkedAt and shownAt properties
 */
function readUpdateDataFile() {
  try {
    if (!_fsExtra.default.existsSync(getPersistenceDirectory())) {
      _fsExtra.default.mkdirSync(getPersistenceDirectory(), {
        recursive: true
      });
    }
    const persistedData = JSON.parse(_fsExtra.default.readFileSync(_path.default.join(getPersistenceDirectory(), 'data.json')));
    // Reconstruct the map
    persistedData.remoteVersions = new _map.default((0, _entries2.default)(persistedData.remoteVersions));
    return persistedData;
  } catch (error) {
    // Return the default if no existing update file is found
    if (error.code === 'ENOENT') {
      return {
        localVersion: '0.0.0',
        remoteVersions: new _map.default(),
        checkedAt: DEFAULT_DATETIME_MS,
        shownAt: DEFAULT_DATETIME_MS
      };
    }
    throw error;
  }
}

/**
 * Writes update data to a file within .redwood for persistence
 * @param {UpdateData} updateData The data to persist.
 */
function updateUpdateDataFile({
  localVersion,
  remoteVersions,
  checkedAt,
  shownAt
} = {}) {
  const existingData = readUpdateDataFile();
  const updatedData = {
    localVersion: localVersion ?? existingData.localVersion,
    remoteVersions: (0, _fromEntries.default)(remoteVersions ?? existingData.remoteVersions),
    checkedAt: checkedAt ?? existingData.checkedAt,
    shownAt: shownAt ?? existingData.shownAt
  };
  _fsExtra.default.writeFileSync(_path.default.join(getPersistenceDirectory(), 'data.json'), (0, _stringify.default)(updatedData, null, 2));
}
function extractTagFromVersion(version) {
  var _context3;
  const tagIndex = (0, _indexOf.default)(version).call(version, '-');
  if (tagIndex === -1) {
    return '';
  }
  const tag = (0, _trim.default)(_context3 = version.substring(tagIndex + 1)).call(_context3);
  return (0, _includes.default)(tag).call(tag, '.') ? tag.split('.')[0] : tag;
}

/**
 * Yargs middleware which will automatically check and show update messages.
 * @param {string[]} argv arguments
 */
function updateCheckMiddleware(argv) {
  if ((0, _includes.default)(EXCLUDED_COMMANDS).call(EXCLUDED_COMMANDS, argv._[0])) {
    return;
  }
  if (shouldShow()) {
    (0, _locking.setLock)(SHOW_LOCK_IDENTIFIER);
    process.on('exit', () => {
      showUpdateMessage();
      (0, _locking.unsetLock)(SHOW_LOCK_IDENTIFIER);
    });
  }
  if (shouldCheck()) {
    (0, _locking.setLock)(CHECK_LOCK_IDENTIFIER);
    (0, _background.spawnBackgroundProcess)('updateCheck', 'yarn', ['node', _path.default.join(__dirname, 'updateCheckExecute.js')]);
  }
}