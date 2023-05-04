/* eslint-env es6, node */

/**
 * Inspired packagephobia.com source
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import core, { getInput } from '@actions/core'
import { exec, getExecOutput } from '@actions/exec'
import fs from 'fs-extra'
import prettyBytes from 'pretty-bytes'
import { v4 as uuidv4 } from 'uuid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const frameworkPath = path.resolve(__dirname, '../../')
const yarnDir = path.join(frameworkPath, '.yarn', 'releases')
const yarnBin = path.resolve(
  path.join(yarnDir, fs.readdirSync(yarnDir).sort().reverse()[0])
)

const packageNames = new Set()
const packageFrameworkDirectories = new Map()
const packageTestingDirectories = new Map()

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

function copyRedwoodPackageToTempDirectory(
  packageName,
  tempDirectory,
  portalsUsed
) {
  // Return if the package has already been copied
  const tempPackageDirectoryName = packageName.substring(11)
  if (fs.existsSync(path.join(tempDirectory, tempPackageDirectoryName))) {
    return
  }

  // Ensure the package exists
  const packageDirectory = packageFrameworkDirectories.get(packageName)
  if (!packageDirectory) {
    console.log(`Could not find package directory for ${packageName}!`)
    return
  }
  const packageJSONFile = path.join(
    frameworkPath,
    packageDirectory,
    'package.json'
  )
  if (!fs.existsSync(packageJSONFile)) {
    console.log(`Could not find package.json for ${packageName}!`)
    return
  }

  // Find the package.json
  const packageJSON = JSON.parse(fs.readFileSync(packageJSONFile, 'utf8'))

  // Copy only content that would be published to npm
  const contentToCopy = [
    'package.json',
    'README.md',
    'LICENSE',
    ...(packageJSON.files || []),
  ]
  fs.mkdirSync(path.join(tempDirectory, tempPackageDirectoryName))
  for (const content of contentToCopy) {
    if (fs.existsSync(path.join(frameworkPath, packageDirectory, content))) {
      fs.copySync(
        path.join(frameworkPath, packageDirectory, content),
        path.join(tempDirectory, tempPackageDirectoryName, content)
      )
    }
  }

  // Determine any redwoodjs packages that are required by this package
  const requiredRedwoodPackages = Object.keys(packageJSON.dependencies).filter(
    (dep) => dep.startsWith('@redwoodjs')
  )
  for (const requiredRedwoodPackage of requiredRedwoodPackages) {
    // Update the package.json to use the local packages
    // 'portal' - creates a link to the folder and follows dependencies
    //  See https://github.com/yarnpkg/berry/issues/4478, cannot have multiple portals to the same folder - boo!
    if (portalsUsed.includes(requiredRedwoodPackage)) {
      // If it was previously added as a portal we'll already be counting it's size, so skip it
      delete packageJSON.dependencies[requiredRedwoodPackage]
      continue
    }

    // Update the package to use a portal
    packageJSON.dependencies[requiredRedwoodPackage] = `portal:${path.join(
      tempDirectory,
      requiredRedwoodPackage.replace('@redwoodjs/', '')
    )}`
    portalsUsed.push(requiredRedwoodPackage)

    // Copy the required redwood packages to the temp directory
    copyRedwoodPackageToTempDirectory(
      requiredRedwoodPackage,
      tempDirectory,
      portalsUsed
    )
  }
  // Write the updated package.json
  fs.writeFileSync(
    path.join(tempDirectory, tempPackageDirectoryName, 'package.json'),
    JSON.stringify(packageJSON, undefined, 2)
  )
}

async function measurePackageSize(packageName, tempDirectory) {
  // Clear the temp directory
  fs.emptyDirSync(tempDirectory)

  // Copy the package of interest to the temp directory
  copyRedwoodPackageToTempDirectory(packageName, tempDirectory, [])

  // Run yarn install
  const tempPackageDirectoryName = packageName.substring(11)
  await exec('node', [yarnBin, 'plugin', 'import', 'workspace-tools'], {
    cwd: path.join(tempDirectory, tempPackageDirectoryName),
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
      cwd: path.join(tempDirectory, tempPackageDirectoryName),
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
      tempPackageDirectoryName,
      'node_modules',
      '.yarn-state.yml'
    )
  )

  const packageJSON = JSON.parse(
    fs.readFileSync(
      path.join(tempDirectory, tempPackageDirectoryName, 'package.json'),
      'utf8'
    )
  )

  // Measure size
  let size = 0
  const directoriesToInclude = ['node_modules', ...(packageJSON.files || [])]
  for (const directory of directoriesToInclude) {
    size += getDirSize(
      path.join(tempDirectory, tempPackageDirectoryName, directory),
      new Set()
    )
  }

  return size
}

async function installAndBuildPackages() {
  console.log('Installing and building packages...')
  await exec('node', [yarnBin, 'install'], {
    cwd: frameworkPath,
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })
  await exec('node', [yarnBin, 'build'], {
    cwd: frameworkPath,
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })
}

async function main() {
  // Build the framework packages
  await installAndBuildPackages()

  // Get all package directories
  const packageJSONFiles = findPackageJSONFiles(
    path.join(frameworkPath, 'packages')
  )
  // Generate a map of package name to directory
  for (const packageJSONFile of packageJSONFiles) {
    const packageJSON = JSON.parse(
      fs.readFileSync(packageJSONFile, { encoding: 'utf8' })
    )
    packageNames.add(packageJSON.name)
    packageFrameworkDirectories.set(
      packageJSON.name,
      packageJSON.repository.directory
    )
    packageTestingDirectories.set(
      packageJSON.name,
      packageJSON.name.substring(11)
    )
  }

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
  for (const packageName of packageNames) {
    if (
      changedFiles.some((changedFile) => {
        return changedFile.startsWith(
          packageFrameworkDirectories.get(packageName)
        )
      })
    ) {
      packagesWithChanges.add(packageName)
    }
  }

  // TODO: Remove this
  packagesWithChanges.clear()
  packagesWithChanges.add('create-redwood-app')

  // Exit early if no changes detected
  if (packagesWithChanges.size === 0) {
    console.log('No changes detected in any packages.')
    return
  }

  console.log('Changes have been detected in the following packages:')
  for (const packageWithChanges of packagesWithChanges) {
    console.log(` - ${packageWithChanges}`)
  }

  // Create temp directory
  const tempTestingDirectory = path.join('/tmp', `rw-${uuidv4()}`)
  console.log(`Using temp directory: ${tempTestingDirectory}`)
  fs.ensureDirSync(tempTestingDirectory)

  // Cleanup temp directory on exit
  process.on('exit', () => {
    // TODO: Add this back
    // fs.removeSync(tempTestingDirectory)
  })

  // Get PR branch package sizes
  console.log('Getting PR branch package sizes:')
  const prPackageSizes = new Map()
  for (const packageWithChanges of packagesWithChanges) {
    console.log(` - Measuring size of '${packageWithChanges}'...`)
    const size = await measurePackageSize(
      packageWithChanges,
      tempTestingDirectory
    )
    console.log(`   - Size: ${size} (${prettyBytes(size)})`)
    prPackageSizes.set(packageWithChanges, size)
  }

  // Checkout main branch, remove stray files and cleanout temp directory
  console.log('Checking out main branch...')
  await exec('git checkout main', undefined, {
    cwd: frameworkPath,
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })
  await exec('git clean -fd', undefined, {
    cwd: frameworkPath,
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })
  fs.emptyDirSync(tempTestingDirectory)

  // Install dependencies and build packages for the main branch
  await installAndBuildPackages()

  // Get main branch package sizes
  console.log('Getting main branch package sizes:')
  const mainPackageSizes = new Map()
  for (const packageWithChanges of packagesWithChanges) {
    console.log(` - Measuring size of '${packageWithChanges}'...`)
    const size = await measurePackageSize(
      packageWithChanges,
      tempTestingDirectory
    )
    console.log(`   - Size: ${size} (${prettyBytes(size)})`)
    mainPackageSizes.set(packageWithChanges, size)
  }

  // Generate a report message and set the github ci output variable
  console.log('Generating PR comment...')
  const numberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
  })
  const tableRows = []
  for (const [packageName, prPackageSize] of prPackageSizes) {
    const mainPackageSize = mainPackageSizes.get(packageName)
    const change = ((prPackageSize - mainPackageSize) / mainPackageSize) * 100
    const icon = change > 0 ? (change > 0.02 ? '🔴' : '🟡') : '🟢'
    tableRows.push(
      [
        packageName,
        prettyBytes(mainPackageSize),
        prettyBytes(prPackageSize),
        prettyBytes(prPackageSize - mainPackageSize),
        `${change > 0 ? '+' : ''}${numberFormatter.format(change)}`,
        icon,
      ].join('|')
    )
  }
  let message = [
    '### 📦 Package Size Changes',
    'The following packages were altered and triggered an install size check.',
    '',
    '| Package | Main   | PR     | Change | Change [%] |      |',
    '| ------- | -----: | -----: | -----: | ---------: | :--: |',
    ...tableRows,
    '',
    `*Last updated: ${new Date().toISOString()}*`,
  ].join('\n')

  core.setOutput('message', message)
}

main()
