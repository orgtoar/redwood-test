/* eslint-env es6, node */

/**
 * Inspired packagephobia.com source
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import core from '@actions/core'
import execa from 'execa'
import fs from 'fs-extra'
import prettyBytes from 'pretty-bytes'
import { v4 as uuidv4 } from 'uuid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Copied from https://github.com/styfle/packagephobia/blob/165578bb35dfde3b6c88ea0ac944a75e5faaabfa/src/util/backend/npm-stats.ts#LL11C4-L11C4
export function getDirSize(root, seen) {
  const stats = fs.lstatSync(root)
  if (seen.has(stats.ino)) {
    return 0
  }
  seen.add(stats.ino)
  if (!stats.isDirectory()) {
    return stats.size
  }
  return fs
    .readdirSync(root)
    .map((file) => getDirSize(path.join(root, file), seen))
    .reduce((acc, num) => acc + num, 0)
}

// Copies local packages to a temp directory and runs yarn install to determine install size
async function main(packageName) {
  console.log(`Checking install size for package: '${packageName}'`)

  const frameworkPath = path.resolve(__dirname, '../../')
  const frameworkPackagesPath = path.resolve(frameworkPath, 'packages')

  // Create temp directory
  const tempTestingDirectory = path.join('/tmp', `rw-${uuidv4()}`)
  fs.ensureDirSync(tempTestingDirectory)
  console.log(`Using temp directory: ${tempTestingDirectory}`)

  // Cleanup temp directory on exit
  process.on('exit', () => {
    fs.removeSync(tempTestingDirectory)
  })

  // Copy the package of interest to the temp directory
  console.log(`Copying packages to temp directory: \n - ${packageName}`)
  const packageFolderName = packageName.replace('@redwoodjs/', '')
  fs.copySync(
    path.join(frameworkPackagesPath, packageFolderName),
    path.join(tempTestingDirectory, packageFolderName)
  )
  // Remove any existing node_modules
  fs.removeSync(
    path.join(tempTestingDirectory, packageFolderName, 'node_modules')
  )

  // Find any @redwoodjs dependencies and copy them to the temp directory
  const packageJSON = JSON.parse(
    fs.readFileSync(
      path.join(tempTestingDirectory, packageFolderName, 'package.json'),
      'utf8'
    )
  )
  const requiredRedwoodPackages = Object.keys(packageJSON.dependencies).filter(
    (dep) => dep.startsWith('@redwoodjs')
  )
  for (const requiredRedwoodPackage of requiredRedwoodPackages) {
    // Copy the redwood package to the temp directory
    console.log(` - ${requiredRedwoodPackage.substring(11)}`)
    const requiredPackageFolderName = requiredRedwoodPackage.replace(
      '@redwoodjs/',
      ''
    )
    fs.copySync(
      path.join(frameworkPackagesPath, requiredPackageFolderName),
      path.join(tempTestingDirectory, requiredPackageFolderName)
    )
    // Remove any existing node_modules
    fs.removeSync(
      path.join(tempTestingDirectory, requiredPackageFolderName, 'node_modules')
    )

    // Update the package.json to use the local packages
    packageJSON.dependencies[requiredRedwoodPackage] = `file:${path.resolve(
      path.join(tempTestingDirectory, requiredPackageFolderName)
    )}`
  }
  // Write the updated package.json
  fs.writeFileSync(
    path.join(tempTestingDirectory, packageFolderName, 'package.json'),
    JSON.stringify(packageJSON, undefined, 2)
  )

  // Run yarn install
  console.log('Running yarn commands...')
  await execa('yarn', ['plugin', 'import', 'workspace-tools'], {
    cwd: path.join(tempTestingDirectory, packageFolderName),
    env: {
      YARN_CACHE_FOLDER: path.join(tempTestingDirectory, 'yarn-cache'),
      YARN_NPM_REGISTRY_SERVER: 'https://registry.npmjs.org',
      YARN_NODE_LINKER: 'node-modules',
    },
  })
  await execa('yarn', ['workspaces', 'focus', '--all', '--production'], {
    cwd: path.join(tempTestingDirectory, packageFolderName),
    env: {
      YARN_CACHE_FOLDER: path.join(tempTestingDirectory, 'yarn-cache'),
      YARN_NPM_REGISTRY_SERVER: 'https://registry.npmjs.org',
      YARN_NODE_LINKER: 'node-modules',
    },
  })

  // Remove files that are not needed for the package size measurement
  fs.rmSync(
    path.join(
      tempTestingDirectory,
      packageFolderName,
      'node_modules',
      '.yarn-state.yml'
    )
  )

  // Measure size of node_modules
  console.log('Measuring size of node_modules...')
  const seen = new Set()
  const size = getDirSize(
    path.join(tempTestingDirectory, packageFolderName, 'node_modules'),
    seen
  )

  // Set the github ci output variable
  core.setOutput('size', size)
  console.log(`Size of node_modules: ${prettyBytes(size)}`)
}

// TODO - get package name from input
main('create-redwood-app')
