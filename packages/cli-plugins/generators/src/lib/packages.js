import path from 'path'

import execa from 'execa'
import fs from 'fs-extra'

import { getPaths } from './index'

/**
 * Installs a dependency
 * If the package is already installed, this function does nothing.
 *
 * @param {string} package @scope/package-name
 * @param {string} version semver package version
 */
export async function installModule(packageName, version) {
  /**
   * TODO:
   *  This will need to be able to handle what happens if you want a version which is
   *  not the same as the currently installed version.
   */

  if (!isModuleInstalled(packageName)) {
    // We use `version` to make sure we install the same version as the rest
    // of the RW packages
    // TODO: DANGER REMOVE THIS CALL TO YALC AND USE YARN ADD
    await execa.command(
      `yarn dlx yalc link ${packageName}@${version} --dev --no-pure`,
      {
        stdio: 'inherit',
        cwd: getPaths().base,
      }
    )
  }
}

/**
 * Installs a Redwood module into a user's project keeping the version consistent with that of \@redwoodjs/cli.
 * If the module is already installed, this function does nothing.
 * If no remote version can not be found which matches the local cli version then the latest canary version will be used.
 *
 * @param {string} module A redwoodjs module, e.g. \@redwoodjs/web
 */
export async function installRedwoodModule(module) {
  const packageJsonPath = require.resolve('@redwoodjs/cli/package.json')
  let { version } = fs.readJSONSync(packageJsonPath)

  if (!isModuleInstalled(module)) {
    const { stdout } = await execa.command(
      `yarn npm info ${module} --fields versions --json`
    )

    // If the version includes a plus, like '4.0.0-rc.428+dd79f1726'
    // (all @canary, @next, and @rc packages do), get rid of everything after the plus.
    if (version.includes('+')) {
      version = version.split('+')[0]
    }

    const versionIsPublished = JSON.parse(stdout).versions.includes(version)

    if (!versionIsPublished) {
      // Fallback to canary. This is most likely because it's a new package
      version = 'canary'
    }

    // We use `version` to make sure we install the same version as the rest
    // of the RW packages
    await execa.command(`yarn add -D ${module}@${version}`, {
      stdio: 'inherit',
      cwd: getPaths().base,
    })
  }
}

/**
 * Check if a user's project's package.json has a module listed as a dependency
 * or devDependency. If not, check node_modules.
 *
 * @param {string} module
 */
export function isModuleInstalled(module) {
  const { dependencies, devDependencies } = fs.readJSONSync(
    path.join(getPaths().base, 'package.json')
  )

  const deps = {
    ...dependencies,
    ...devDependencies,
  }

  if (deps[module]) {
    return true
  }

  // Check any of the places require would look for this module.
  // This enables testing with `yarn rwfw project:copy`.
  //
  // We can't use require.resolve here because it caches the exception
  // Making it impossible to require when we actually do install it...
  return require.resolve
    .paths(`${module}/package.json`)
    .some((requireResolvePath) => {
      return fs.existsSync(path.join(requireResolvePath, module))
    })
}
