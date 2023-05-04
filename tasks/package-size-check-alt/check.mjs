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

const yarnCacheDirectory = path.join('/tmp', `yarn-cache-${uuidv4()}`)

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

function getRedwoodDependenciesOfPackage(packageName) {
  const packageFrameworkDirectory = packageFrameworkDirectories.get(packageName)
  if (!packageFrameworkDirectory) {
    console.log(`Could not find package directory for ${packageName}!`)
    return []
  }
  if (
    !fs.existsSync(
      path.join(frameworkPath, packageFrameworkDirectory, 'package.json')
    )
  ) {
    console.log(`Could not find package.json for ${packageName}!`)
    return []
  }

  const packageJSON = JSON.parse(
    fs.readFileSync(
      path.join(frameworkPath, packageFrameworkDirectory, 'package.json'),
      'utf8'
    )
  )
  const redwoodDeps = Object.keys(packageJSON.dependencies).filter((dep) =>
    dep.startsWith('@redwoodjs')
  )
  for (const redwoodDep of redwoodDeps) {
    redwoodDeps.push(...getRedwoodDependenciesOfPackage(redwoodDep))
  }
  return Array.from(new Set(redwoodDeps))
}

async function measurePackageSize(packageName, tempDirectory) {
  // Clear the temp directory
  fs.emptyDirSync(tempDirectory)

  // Check the package exists
  const packageFrameworkDirectory = packageFrameworkDirectories.get(packageName)
  if (!packageFrameworkDirectory) {
    console.log(`Could not find package directory for ${packageName}!`)
    return 0
  }

  const redwoodPackagesUsed = Array.from(
    new Set([packageName, ...getRedwoodDependenciesOfPackage(packageName)])
  )

  const nonRedwoodPackagesUsed = new Map()
  for (const redwoodPackage of redwoodPackagesUsed) {
    // Get the package.json
    const packageFrameworkDirectory =
      packageFrameworkDirectories.get(redwoodPackage)
    const packageJSON = JSON.parse(
      fs.readFileSync(
        path.join(frameworkPath, packageFrameworkDirectory, 'package.json'),
        'utf8'
      )
    )

    // Add any non-redwood packages to the list
    for (const dep of Object.keys(packageJSON.dependencies)) {
      if (!dep.startsWith('@redwoodjs')) {
        if (!nonRedwoodPackagesUsed.has(dep)) {
          nonRedwoodPackagesUsed.set(dep, packageJSON.dependencies[dep])
        }
      }
    }

    // Copy the package to the temp directory
    const packageTempDirectory = packageTestingDirectories.get(redwoodPackage)
    const contentToCopy = [
      'package.json',
      'README.md',
      'LICENSE',
      ...(packageJSON.files || []),
    ]
    fs.mkdirSync(path.join(tempDirectory, packageTempDirectory))
    for (const content of contentToCopy) {
      if (
        fs.existsSync(
          path.join(frameworkPath, packageFrameworkDirectory, content)
        )
      ) {
        fs.copySync(
          path.join(frameworkPath, packageFrameworkDirectory, content),
          path.join(tempDirectory, packageTempDirectory, content)
        )
      }
    }
  }

  // Write the custom package.json with all the redwood packages as links and the non-redwood packages as dependencies
  const customPackageJSON = {
    name: 'none',
    version: '1.0.0',
    description: 'None',
    dependencies: {
      ...Object.fromEntries(
        [...redwoodPackagesUsed].map((dep) => [
          dep,
          `link:${path.join(
            tempDirectory,
            packageTestingDirectories.get(dep)
          )}`,
        ])
      ),
      ...Object.fromEntries(nonRedwoodPackagesUsed),
    },
  }
  const customPackageDirectory = path.join(tempDirectory, 'custom-package')
  fs.mkdirSync(customPackageDirectory)
  fs.writeFileSync(
    path.join(tempDirectory, 'custom-package', 'package.json'),
    JSON.stringify(customPackageJSON, undefined, 2)
  )

  // Run yarn install
  await exec('node', [yarnBin, 'plugin', 'import', 'workspace-tools'], {
    cwd: customPackageDirectory,
    env: {
      ...process.env,
      YARN_CACHE_FOLDER: yarnCacheDirectory,
      YARN_NPM_REGISTRY_SERVER: 'https://registry.npmjs.org',
      YARN_NODE_LINKER: 'node-modules',
    },
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })
  await exec(
    'node',
    [yarnBin, 'workspaces', 'focus', '--all', '--production'],
    {
      cwd: customPackageDirectory,
      env: {
        ...process.env,
        YARN_CACHE_FOLDER: yarnCacheDirectory,
        YARN_NPM_REGISTRY_SERVER: 'https://registry.npmjs.org',
        YARN_NODE_LINKER: 'node-modules',
      },
      silent: true && !process.env.REDWOOD_CI_VERBOSE,
    }
  )

  // Remove files that are not needed for the package size measurement
  fs.rmSync(
    path.join(customPackageDirectory, 'node_modules', '.yarn-state.yml')
  )

  // Measure size of node_modules
  const size = getDirSize(
    path.join(customPackageDirectory, 'node_modules'),
    new Set()
  )
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
      packageJSON.name.replace('@redwoodjs/', '')
    )
  }

  // Get a list of all files that have changed compared to the main branch
  const branch = process.env.GITHUB_BASE_REF
  console.log('BRANCH: ', branch)
  await exec(`git fetch origin main`, undefined, {
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })
  const { stdout } = await getExecOutput(
    `git diff origin/main --name-only`,
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

  // Cleanup temp directories on exit
  process.on('exit', () => {
    fs.removeSync(tempTestingDirectory)
    fs.removeSync(yarnCacheDirectory)
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
  fs.emptyDirSync(yarnCacheDirectory)

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

  // Return to the PR branch (useful if run locally)
  await exec(`git checkout ${branch}`, undefined, {
    cwd: frameworkPath,
    silent: true && !process.env.REDWOOD_CI_VERBOSE,
  })

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
