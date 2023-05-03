/* eslint-env es6, node */

/**
 * Inspired packagephobia.com source
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import core from '@actions/core'
import { exec, getExecOutput } from '@actions/exec'
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

function findPackageJSONFiles(rootDirectory) {
  const packageJSONFiles = []
  const rootContents = fs.readdirSync(rootDirectory)
  if (rootContents.includes('package.json')) {
    return [path.join(rootDirectory, 'package.json')]
  }
  for (const content of rootContents) {
    const fullPath = path.join(rootDirectory, content)
    if (fs.statSync(fullPath).isDirectory() && content !== 'node_modules') {
      packageJSONFiles.push(...findPackageJSONFiles(fullPath))
    }
  }
  return packageJSONFiles
}

async function measurePackageSize(
  tempDirectory,
  frameworkPath,
  frameworkPackagesPath,
  packageName
) {
  // Copy the package of interest to the temp directory
  const packageFolderName = packageName.replace('@redwoodjs/', '')
  fs.copySync(
    path.join(frameworkPackagesPath, packageFolderName),
    path.join(tempDirectory, packageFolderName)
  )
  // Remove any existing node_modules
  fs.removeSync(path.join(tempDirectory, packageFolderName, 'node_modules'))

  // Find any @redwoodjs dependencies and copy them to the temp directory
  const packageJSON = JSON.parse(
    fs.readFileSync(
      path.join(tempDirectory, packageFolderName, 'package.json'),
      'utf8'
    )
  )
  const requiredRedwoodPackages = Object.keys(packageJSON.dependencies).filter(
    (dep) => dep.startsWith('@redwoodjs')
  )
  for (const requiredRedwoodPackage of requiredRedwoodPackages) {
    // Copy the redwood package to the temp directory
    const requiredPackageFolderName = requiredRedwoodPackage.replace(
      '@redwoodjs/',
      ''
    )
    fs.copySync(
      path.join(frameworkPackagesPath, requiredPackageFolderName),
      path.join(tempDirectory, requiredPackageFolderName)
    )
    // Remove any existing node_modules
    fs.removeSync(
      path.join(tempDirectory, requiredPackageFolderName, 'node_modules')
    )

    // Update the package.json to use the local packages
    packageJSON.dependencies[requiredRedwoodPackage] = `file:${path.resolve(
      path.join(tempDirectory, requiredPackageFolderName)
    )}`
  }
  // Write the updated package.json
  fs.writeFileSync(
    path.join(tempDirectory, packageFolderName, 'package.json'),
    JSON.stringify(packageJSON, undefined, 2)
  )

  const yarnDir = path.join(frameworkPath, '.yarn', 'releases')
  const yarnBin = path.resolve(
    path.join(yarnDir, fs.readdirSync(yarnDir).sort().reverse()[0])
  )

  // Run yarn install
  await exec('node', [yarnBin, 'plugin', 'import', 'workspace-tools'], {
    cwd: path.join(tempDirectory, packageFolderName),
    env: {
      ...process.env,
      YARN_CACHE_FOLDER: path.join(tempDirectory, 'yarn-cache'),
      YARN_NPM_REGISTRY_SERVER: 'https://registry.npmjs.org',
      YARN_NODE_LINKER: 'node-modules',
    },
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })
  await exec(
    'node',
    [yarnBin, 'workspaces', 'focus', '--all', '--production'],
    {
      cwd: path.join(tempDirectory, packageFolderName),
      env: {
        ...process.env,
        YARN_CACHE_FOLDER: path.join(tempDirectory, 'yarn-cache'),
        YARN_NPM_REGISTRY_SERVER: 'https://registry.npmjs.org',
        YARN_NODE_LINKER: 'node-modules',
      },
      silent: true && !process.env.REDWOOD_CI_VERBOSE,
    }
  )

  // Remove files that are not needed for the package size measurement
  fs.rmSync(
    path.join(
      tempDirectory,
      packageFolderName,
      'node_modules',
      '.yarn-state.yml'
    )
  )

  // Measure size of node_modules and return number of bytes
  const seen = new Set()
  return getDirSize(
    path.join(tempDirectory, packageFolderName, 'node_modules'),
    seen
  )
}

// Copies local packages to a temp directory and runs yarn install to determine install size
async function main() {
  const frameworkPath = path.resolve(__dirname, '../../')
  const frameworkPackagesPath = path.resolve(frameworkPath, 'packages')

  // Get all package directories
  const packageJSONFiles = findPackageJSONFiles(frameworkPackagesPath)
  const packageJSONDirectories = packageJSONFiles.map((file) =>
    path.dirname(file).substring(frameworkPath.length + 1)
  )

  // Get a list of all files that have changed compared to the main branch
  const branch = process.env.GITHUB_BASE_REF || 'jgmw-ci/deps-change' // TODO: Remove this default
  await exec(`git fetch origin ${branch}`, undefined, {
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })
  const { stdout } = await getExecOutput(
    `git diff origin/${branch} --name-only`,
    undefined,
    {
      silent: true && !process.env.REDWOOD_CI_VERBOSE,
    }
  )
  const changedFiles = stdout.toString().trim().split('\n').filter(Boolean)

  // Determine which packages have changes
  const packagesWithChanges = new Set()
  for (const packageJSONDirectory of packageJSONDirectories) {
    if (
      changedFiles.some((changedFile) => {
        return changedFile.startsWith(packageJSONDirectory)
      })
    ) {
      packagesWithChanges.add(packageJSONDirectory)
    }
  }
  console.log('Changes have been detected in the following packages:')
  for (const packageWithChanges of packagesWithChanges) {
    console.log(` - ${packageWithChanges.substring(9)}`)
  }

  // Create temp directory
  const tempTestingDirectory = path.join('/tmp', `rw-${uuidv4()}`)
  fs.ensureDirSync(tempTestingDirectory)
  console.log(`Using temp directory: ${tempTestingDirectory}`)

  // Cleanup temp directory on exit
  process.on('exit', () => {
    fs.removeSync(tempTestingDirectory)
  })

  // Get PR branch package sizes
  console.log('Getting PR branch package sizes:')
  const prPackageSizes = new Map()
  for (const packageWithChanges of packagesWithChanges) {
    const packageName = JSON.parse(
      fs.readFileSync(
        path.join(frameworkPath, packageWithChanges, 'package.json'),
        'utf8'
      )
    ).name
    console.log(` - Measuring size of ${packageName}...`)
    const packageSize = await measurePackageSize(
      tempTestingDirectory,
      frameworkPath,
      frameworkPackagesPath,
      packageName
    )
    prPackageSizes.set(packageName, packageSize)
  }
  console.log('PR branch package sizes:', prPackageSizes)

  // Get main branch package sizes
  // TODO

  // Generate a report message and set the github ci output variable
  const tableRows = []
  for (const [packageName, prPackageSize] of prPackageSizes) {
    tableRows.push(
      `| ${packageName} | ? | ${prettyBytes(prPackageSize)} | ? | ? |`
    )
  }
  let message = [
    '### 📦 Package Size Changes',
    'The following packages were altered and triggered an install size check.',
    '',
    '| Package | Main   | PR     | Change [%] |      |',
    '| ------- | -----: | -----: | ---------: | :--: |',
    ...tableRows,
    '',
    `*Last updated: ${new Date().toISOString()}*`,
  ].join('\n')

  core.setOutput('message', message)
}

main()
