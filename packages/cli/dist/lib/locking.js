"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.clearLocks = clearLocks;
exports.isLockSet = isLockSet;
exports.setLock = setLock;
exports.unsetLock = unsetLock;
var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _index = require("./index");
/**
 * Creates the ".redwood/locks" directory if it does not exist
 */
function ensureLockDirectoryExists() {
  const locksPath = _path.default.join((0, _index.getPaths)().generated.base, 'locks');
  if (!_fsExtra.default.existsSync(locksPath)) {
    _fsExtra.default.mkdirSync(locksPath, {
      recursive: true
    });
  }
}

/**
 * Creates a lock with the specified identifier
 * @param {string} identifier ID of the lock
 * @throws Will throw an error if the lock is already set
 */
function setLock(identifier) {
  ensureLockDirectoryExists();
  if (isLockSet(identifier)) {
    throw new Error(`Lock "${identifier}" is already set`);
  }
  _fsExtra.default.writeFileSync(_path.default.join((0, _index.getPaths)().generated.base, 'locks', identifier), '');
}

/**
 * Removes a lock with the specified identifier
 * @param {string} identifier ID of the lock
 */
function unsetLock(identifier) {
  try {
    _fsExtra.default.rmSync(_path.default.join((0, _index.getPaths)().generated.base, 'locks', identifier));
  } catch (error) {
    // If the lock doesn't exist it's okay to not throw an error
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Determines if a lock with the specified identifier is currently set
 * @param {string} identifier ID of the lock
 * @returns {boolean} `true` if the lock is set, otherwise `false`
 */
function isLockSet(identifier) {
  const lockfilePath = _path.default.join((0, _index.getPaths)().generated.base, 'locks', identifier);

  // Check if the lock file exists
  const exists = _fsExtra.default.existsSync(lockfilePath);
  if (!exists) {
    return false;
  }

  // Ensure this lock isn't stale due to some error
  // Locks are only valid for 1 hour
  const createdAt = _fsExtra.default.statSync(lockfilePath).birthtimeMs;
  if ((0, _now.default)() - createdAt > 3600000) {
    unsetLock(identifier);
    return false;
  }

  // If the lock file exists and isn't stale, the lock is set
  return true;
}

/**
 * Unsets a list of locks, when no identifiers are specified all existing locks are unset
 * @param {string[]} identifiers List of lock identifiers
 */
function clearLocks(identifiers = []) {
  ensureLockDirectoryExists();
  if (identifiers.length > 0) {
    for (const id of identifiers) {
      unsetLock(id);
    }
  } else {
    const locks = _fsExtra.default.readdirSync(_path.default.join((0, _index.getPaths)().generated.base, 'locks'));
    for (const lock of locks) {
      unsetLock(lock);
    }
  }
}