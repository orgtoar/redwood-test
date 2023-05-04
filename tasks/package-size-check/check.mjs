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

const frameworkPath = path.resolve(__dirname, '../../')
const yarnDir = path.join(frameworkPath, '.yarn', 'releases')
const yarnBin = path.resolve(
  path.join(yarnDir, fs.readdirSync(yarnDir).sort().reverse()[0])
)

const packageNameToDirectory = new Map()

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

function copyRedwoodPackageToTempDirectory(packageDirectory, tempDirectory) {
  // Find the package.json
  const packageJSON = JSON.parse(
    fs.readFileSync(
      path.join(frameworkPath, packageDirectory, 'package.json'),
      'utf8'
    )
  )

  // Copy only content that would be published to npm
  const contentToCopy = [
    'package.json',
    'README.md',
    'LICENSE',
    ...(packageJSON.files || []),
  ]
  for (const content of contentToCopy) {
    if (fs.existsSync(path.join(frameworkPath, packageDirectory, content))) {
      fs.copySync(
        path.join(frameworkPath, packageDirectory, content),
        path.join(tempDirectory, packageJSON.name.substring(11), content)
      )
    }
  }

  // Determine any redwoodjs packages that are required by this package
  const requiredRedwoodPackages = Object.keys(packageJSON.dependencies).filter(
    (dep) => dep.startsWith('@redwoodjs')
  )
  for (const requiredRedwoodPackage of requiredRedwoodPackages) {
    // Update the package.json to use the local packages
    packageJSON.dependencies[requiredRedwoodPackage] = `file:${path.join(
      tempDirectory,
      requiredRedwoodPackage.replace('@redwoodjs/', '')
    )}`
    // Copy the required redwood packages to the temp directory
    copyRedwoodPackageToTempDirectory(
      packageNameToDirectory.get(requiredRedwoodPackage),
      tempDirectory
    )
  }
  // Write the updated package.json
  fs.writeFileSync(
    path.join(tempDirectory, packageJSON.name.substring(11), 'package.json'),
    JSON.stringify(packageJSON, undefined, 2)
  )
}

async function measurePackageSize(packageDirectory, tempDirectory) {
  // Clear the temp directory
  fs.emptyDirSync(tempDirectory)

  // Copy the package of interest to the temp directory
  copyRedwoodPackageToTempDirectory(packageDirectory, tempDirectory)

  // Run yarn install
  const packageName = packageDirectory.substring(9)
  await exec('node', [yarnBin, 'plugin', 'import', 'workspace-tools'], {
    cwd: path.join(tempDirectory, packageName),
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
      cwd: path.join(tempDirectory, packageName),
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
    path.join(tempDirectory, packageName, 'node_modules', '.yarn-state.yml')
  )

  const packageJSON = JSON.parse(
    fs.readFileSync(
      path.join(tempDirectory, packageName, 'package.json'),
      'utf8'
    )
  )

  // Measure size
  let size = 0
  const directoriesToInclude = ['node_modules', ...(packageJSON.files || [])]
  for (const directory of directoriesToInclude) {
    size += getDirSize(
      path.join(tempDirectory, packageName, directory),
      new Set()
    )
  }

  return size
}

// Copies local packages to a temp directory and runs yarn install to determine install size
async function main() {
  // Build the framework packages
  console.log('Building packages...')
  await exec('node', [yarnBin, 'build'], {
    cwd: frameworkPath,
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })

  // Get all package directories
  const packageJSONFiles = findPackageJSONFiles(
    path.join(frameworkPath, 'packages')
  )
  for (const packageJSONFile of packageJSONFiles) {
    const packageJSON = JSON.parse(
      fs.readFileSync(packageJSONFile, { encoding: 'utf8' })
    )
    packageNameToDirectory.set(
      packageJSON.name,
      packageJSON.repository.directory
    )
  }
  const packageJSONDirectories = packageJSONFiles.map((file) =>
    path.dirname(file).substring(frameworkPath.length + 1)
  )

  // Get a list of all files that have changed compared to the main branch
  const branch = process.env.GITHUB_BASE_REF || 'jgmw-ci/deps-change'
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

  // Exit early if no changes detected
  if (packagesWithChanges.size === 0) {
    console.log('No changes detected in any packages.')
    return
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
    // TODO: Add this back
    // fs.removeSync(tempTestingDirectory)
  })

  // Get PR branch package sizes
  console.log('Getting PR branch package sizes:')
  const prPackageSizes = new Map()
  for (const packageWithChanges of packagesWithChanges) {
    console.log(` - Measuring size of '${packageWithChanges.substring(9)}'...`)
    prPackageSizes.set(
      packageWithChanges.substring(9),
      await measurePackageSize(packageWithChanges, tempTestingDirectory)
    )
  }

  // Checkout main branch and cleanout temp directory
  await exec('git checkout main', undefined, {
    cwd: frameworkPath,
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })
  await exec('git clean -fd', undefined, {
    cwd: frameworkPath,
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })
  fs.emptyDirSync(tempTestingDirectory)

  await exec('node', [yarnBin, 'build'], {
    cwd: frameworkPath,
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })

  // Get main branch package sizes
  console.log('Getting main branch package sizes:')
  const mainPackageSizes = new Map()
  for (const packageWithChanges of packagesWithChanges) {
    console.log(` - Measuring size of '${packageWithChanges.substring(9)}'...`)
    mainPackageSizes.set(
      packageWithChanges.substring(9),
      await measurePackageSize(packageWithChanges, tempTestingDirectory)
    )
  }

  // Generate a report message and set the github ci output variable
  const numberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
  })
  const tableRows = []
  for (const [packageName, prPackageSize] of prPackageSizes) {
    const mainPackageSize = mainPackageSizes.get(packageName)
    const change = ((prPackageSize - mainPackageSize) / mainPackageSize) * 100
    const icon = Math.abs(change) < 0.01 ? '🟡' : change > 0 ? '🔴' : '🟢'
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
