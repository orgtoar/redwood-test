import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import boxen from 'boxen'
import chalk from 'chalk'
import latestVersion from 'latest-version'
import semver from 'semver'

import { getConfig } from '@redwoodjs/project-config'

import { setLock, unsetLock } from './locking'

import { getPaths } from './index'

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
const CHECK_PERIOD = 24 * 60 * 60_000

/**
 * @const {number} The number of milliseconds between showing a user an update notification (24 hours)
 */
const SHOW_PERIOD = 24 * 60 * 60_000

/**
 * @const {number} The default datetime for shownAt and checkedAt in milliseconds, corresponds to 2000-01-01T00:00:00.000Z
 */
export const DEFAULT_DATETIME_MS = 946684800000

/**
 * @const {string} The identifier used for the lock within the check function
 */
export const LOCK_IDENTIFIER = 'UPDATE_CHECK'

/**
 * @const {string[]} The name of commands which should NOT execute the update checker
 */
export const EXCLUDED_COMMANDS = ['upgrade', 'ts-to-js']

/**
 * @const {string} Filepath of the file which persists update check data within the .redwood directory
 */
let persistenceDirectory

function getPersistenceDirectory() {
  if (persistenceDirectory) {
    return persistenceDirectory
  }

  persistenceDirectory = path.join(getPaths().generated.base, 'updateCheck')

  return persistenceDirectory
}

/**
 * Performs an update check to detect if a newer version of redwood is available and records the result to a file within .redwood for persistence
 */
export async function check() {
  try {
    setLock(LOCK_IDENTIFIER)

    // Read package.json and extract the @redwood/core version
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(getPaths().base, 'package.json'))
    )
    let localVersion = packageJson.devDependencies['@redwoodjs/core']

    // Remove any leading non-digits, i.e. ^ or ~
    while (!/\d/.test(localVersion.charAt(0))) {
      localVersion = localVersion.substring(1)
    }

    const remoteVersions = new Map()
    for (const tag of getConfig().notifications.versionUpdates) {
      try {
        remoteVersions.set(
          tag,
          await latestVersion('@redwoodjs/core', { version: tag })
        )
      } catch (error) {
        // This error may result as the ability of the user to specify arbitrary tags within their config file
        console.error(error)
      }
    }

    // Save the latest update information
    updateUpdateDataFile({
      localVersion,
      remoteVersions,
      checkedAt: new Date().getTime(),
    })
  } finally {
    unsetLock(LOCK_IDENTIFIER)
  }
}

/**
 * Determines if background checks are enabled. Checks are enabled within the redwood.toml notifications config.
 */
export function isEnabled() {
  return getConfig().notifications.versionUpdates.length > 0
}

/**
 * Determines if an update check is due based on if enough time has elapsed since the last check
 * @return {boolean} `true` if an update check is overdue
 * @see {@link CHECK_PERIOD} for the time between notifications
 */
export function shouldCheck() {
  const data = readUpdateDataFile()
  return data.checkedAt < new Date().getTime() - CHECK_PERIOD
}

/**
 * Determines if the user should see an update notification based on if a new version is available and enough time has elapsed since the last notification
 * @return {boolean} `true` if the user should see an update notification
 * @see {@link SHOW_PERIOD} for the time between notifications
 */
export function shouldShow() {
  const data = readUpdateDataFile()
  let newerVersion = false
  data.remoteVersions.forEach((version) => {
    newerVersion ||= semver.gt(version, data.localVersion)
  })
  return data.shownAt < new Date().getTime() - SHOW_PERIOD && newerVersion
}

/**
 * Prints the update notification message to the console and updates the stored shownAt property
 * @see {@link getUpdateMessage} for the definition of the string which is printed
 */
export function showUpdateMessage() {
  console.log(getUpdateMessage())
  updateUpdateDataFile({ shownAt: new Date().getTime() })
}

/**
 * Returns a nicely formatted string containing an update notification
 * @return {string} A specifically formatted update notification message
 */
function getUpdateMessage() {
  const data = readUpdateDataFile()

  // Whatever tag the user is currently on or 'latest'
  const localTag = extractTagFromVersion(data.localVersion) || 'latest'

  let updateCount = 0
  let message =
    ' New updates to Redwood are available via `yarn rw upgrade#REPLACEME#` '
  data.remoteVersions.forEach((version, tag) => {
    if (semver.gt(version, data.localVersion)) {
      updateCount += 1

      if (tag === localTag) {
        message += `\n\n ❖  ${chalk.underline(chalk.bold(tag))}:\n     v${
          data.localVersion
        } -> v${version} `
      } else {
        message += `\n\n ❖  ${tag}:\n     v${version} `
      }
    }
  })
  message +=
    '\n\n See release notes at: https://github.com/redwoodjs/redwood/releases '
  message = message.replace('#REPLACEME#', updateCount > 1 ? ' -t [tag]' : '')

  return boxen(message, {
    padding: 0,
    margin: 1,
    title: `Redwood Update${updateCount > 1 ? 's ' : ' '}available 🎉`,
    borderColor: '#0b8379', // The RedwoodJS colour
    borderStyle: 'round',
  })
}

/**
 * Reads update data from a file within .redwood
 * @return {UpdateData} The update data object containing the localVersion, remoteVersion, checkedAt and shownAt properties
 */
export function readUpdateDataFile() {
  try {
    if (!fs.existsSync(getPersistenceDirectory())) {
      fs.mkdirSync(getPersistenceDirectory())
    }
    const persistedData = JSON.parse(
      fs.readFileSync(path.join(getPersistenceDirectory(), 'data.json'))
    )
    // Reconstruct the map
    persistedData.remoteVersions = new Map(
      Object.entries(persistedData.remoteVersions)
    )
    return persistedData
  } catch (error) {
    // Return the default if no existing update file is found
    if (error.code === 'ENOENT') {
      return {
        localVersion: '0.0.0',
        remoteVersions: new Map(),
        checkedAt: DEFAULT_DATETIME_MS,
        shownAt: DEFAULT_DATETIME_MS,
      }
    }

    throw error
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
  shownAt,
} = {}) {
  const existingData = readUpdateDataFile()

  const updatedData = {
    localVersion: localVersion ?? existingData.localVersion,
    remoteVersions: Object.fromEntries(
      remoteVersions ?? existingData.remoteVersions
    ),
    checkedAt: checkedAt ?? existingData.checkedAt,
    shownAt: shownAt ?? existingData.shownAt,
  }

  fs.writeFileSync(
    path.join(getPersistenceDirectory(), 'data.json'),
    JSON.stringify(updatedData, null, 2)
  )
}

function extractTagFromVersion(version) {
  const tagIndex = version.indexOf('-')
  if (tagIndex === -1) {
    return ''
  }
  const tag = version.substring(tagIndex + 1).trim()
  return tag.includes('.') ? tag.split('.')[0] : tag
}

/**
 * Yargs middleware which will automatically check and show update messages.
 * @param {string[]} argv arguments
 */
export function updateCheckMiddleware(argv) {
  if (EXCLUDED_COMMANDS.includes(argv._[0])) {
    return
  }

  if (shouldShow()) {
    process.on('exit', () => {
      showUpdateMessage()
    })
  }

  if (shouldCheck()) {
    if (!fs.existsSync(getPersistenceDirectory())) {
      fs.mkdirSync(getPersistenceDirectory())
    }

    const stdout = fs.openSync(
      path.join(getPersistenceDirectory(), 'stdout.log'),
      'w'
    )

    const stderr = fs.openSync(
      path.join(getPersistenceDirectory(), 'stderr.log'),
      'w'
    )

    // We must account for some platform specific behaviour on windows.
    const spawnOptions =
      os.type() === 'Windows_NT'
        ? {
            // The following options run the process in the background without a console window, even though they don't look like they would.
            // See https://github.com/nodejs/node/issues/21825#issuecomment-503766781 for information
            detached: false,
            windowsHide: false,
            shell: true,
            stdio: ['ignore', stdout, stderr],
          }
        : {
            detached: true,
            stdio: ['ignore', stdout, stderr],
          }
    const child = spawn(
      'yarn',
      ['node', path.join(__dirname, 'updateCheckExecute.js')],
      spawnOptions
    )
    child.unref()
  }
}
