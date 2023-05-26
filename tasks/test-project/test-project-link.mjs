#!/usr/bin/env node
/* eslint-env node, es6*/
//@ts-check
const fs = require('fs')
const os = require('os')
const path = require('path')

const chalk = require('chalk')
const execa = require('execa')
const fse = require('fs-extra')
const Listr = require('listr2').Listr
const { rimraf } = require('rimraf')
const { hideBin } = require('yargs/helpers')
const yargs = require('yargs/yargs')

const {
  addFrameworkDepsToProject,
  copyFrameworkPackages,
} = require('./frameworkLinking')
const {
  getExecaOptions,
  updatePkgJsonScripts,
  confirmNoFixtureNoLink,
} = require('./util')

const args = yargs(hideBin(process.argv))
  .usage('Usage: $0 <project directory> [option]')
  .option('link', {
    default: false,
    type: 'boolean',
    describe:
      'Link the current checked out branch of the framework in the project',
  })
  .option('verbose', {
    default: false,
    type: 'boolean',
    describe: 'Verbose output',
  })
  .option('copyFromFixture', {
    default: true,
    type: 'boolean',
    describe: 'Copy the test project from the __fixtures__ folder',
  })
  .option('rebuildFixture', {
    default: false,
    type: 'boolean',
    describe: 'Rebuild __fixtures__/test-project',
  })
  .option('clean', {
    default: false,
    type: 'boolean',
    describe: 'Delete existing directory, and recreate project',
  })
  .option('canary', {
    default: true,
    type: 'boolean',
    describe:
      'Upgrade project to latest canary version. NOT compatible with --link.',
  })
  .help()
  .parseSync()

const { link, verbose, clean, copyFromFixture, rebuildFixture } = args

// Do not use demandCommand because rebuildFixture doesn't require <project directory>
// Require 1 and only 1 arg if not rebuildFixture
if (!rebuildFixture && args._.length > 1) {
  console.log(
    chalk.red.bold(
      `
      Multiple <project directory> arguments
      Specify ONE project directory outside the framework directory (no spaces allowed)
      EXAMPLE: 'yarn build:test-project ../test-project'
      `
    )
  )
  process.exit(1)
} else if (!rebuildFixture && args._.length < 1) {
  console.log(
    chalk.red.bold(
      `
      Missing <project directory> argument
      Specify a project directory outside the framework directory
      EXAMPLE: 'yarn build:test-project ../test-project'
      `
    )
  )
  process.exit(1)
}

const OUTPUT_PROJECT_PATH = rebuildFixture
  ? path.join(
      os.tmpdir(),
      'redwood-test-project',
      // ":" is problematic with paths
      new Date().toISOString().split(':').join('-')
    )
  : path.resolve(String(args._))

const RW_FRAMEWORKPATH = path.join(__dirname, '../../')

// Project Directory path check: must not be a subdirectory or Yarn will error
const relativePathCheck = path.relative(RW_FRAMEWORKPATH, OUTPUT_PROJECT_PATH)
if (
  relativePathCheck &&
  !relativePathCheck.startsWith('..') &&
  !path.isAbsolute(relativePathCheck)
) {
  console.log(
    chalk.red.bold(
      `
      Project Directory CANNOT be a subdirectory of '${RW_FRAMEWORKPATH}'
      Specify a project directory outside the framework directory
      EXAMPLE: 'yarn build:test-project ../test-project'
      `
    )
  )
  process.exit(1)
}

const createProject = async () => {
  if (clean) {
    await rimraf(OUTPUT_PROJECT_PATH)
  }

  let cmd = `yarn node ./packages/create-redwood-app/dist/create-redwood-app.js ${OUTPUT_PROJECT_PATH}`

  // We create a ts project and convert using ts-to-js at the end if typescript flag is false
  return execa(
    cmd,
    ['--no-yarn-install', '--typescript', '--overwrite', '--no-git'],
    getExecaOptions(RW_FRAMEWORKPATH)
  )
}

const copyProject = async () => {
  if (clean && !rebuildFixture) {
    await rimraf(OUTPUT_PROJECT_PATH)
  }

  const FIXTURE_TESTPROJ_PATH = path.join(
    RW_FRAMEWORKPATH,
    '__fixtures__/test-project'
  )

  if (rebuildFixture) {
    // remove existing Fixture
    await rimraf(FIXTURE_TESTPROJ_PATH)
    // copy from tempDir to Fixture dir
    await fse.copy(OUTPUT_PROJECT_PATH, FIXTURE_TESTPROJ_PATH)
    // cleanup after ourselves
    await rimraf(OUTPUT_PROJECT_PATH)
  } else {
    // copying existing Fixture to new Project
    await fse.copy(FIXTURE_TESTPROJ_PATH, OUTPUT_PROJECT_PATH)
    // Make sure no lockfiles are accidentally copied
    fse.remove(path.join(OUTPUT_PROJECT_PATH, 'yarn.lock'))
  }
}

const globalTasks = () =>
  new Listr(
    [
      {
        title: 'Creating project',
        task: (_ctx, task) => {
          if (copyFromFixture && !rebuildFixture) {
            task.output =
              'Copying test-project from __fixtures__/test-project...'
            return copyProject()
          } else {
            task.output = 'Building test-project from scratch...'
            return createProject()
          }
        },
      },
      {
        title: '[link] Building Redwood framework',
        task: async () => {
          try {
            await execa(
              'yarn build:clean && yarn build',
              [],
              getExecaOptions(RW_FRAMEWORKPATH)
            )
          } catch (e) {
            console.log('Failed to build framework...')
            console.log()
            console.log(
              'Please check your branch is building with yarn build:clean && yarn build'
            )
            throw new Error('Failed to build framework')
          }
        },
        enabled: () => link || rebuildFixture,
      },
      {
        title: '[link] Adding framework dependencies to project',
        task: () =>
          addFrameworkDepsToProject(RW_FRAMEWORKPATH, OUTPUT_PROJECT_PATH),
        enabled: () => link || rebuildFixture,
      },
      {
        title: 'Installing node_modules',
        task: async () => {
          return execa('yarn install', getExecaOptions(OUTPUT_PROJECT_PATH))
        },
      },
      {
        title: '[link] Copying framework packages to project',
        task: () =>
          copyFrameworkPackages(RW_FRAMEWORKPATH, OUTPUT_PROJECT_PATH),
        enabled: () => link || rebuildFixture,
      },
      {
        title: '[link] Add rwfw project:copy postinstall',
        task: () => {
          updatePkgJsonScripts({
            projectPath: OUTPUT_PROJECT_PATH,
            scripts: {
              postinstall: 'yarn rwfw project:copy',
            },
          })
        },
        enabled: () => link || rebuildFixture, // Note that we undo this when we rebuildFixture at the end
      },
      {
        title: 'Generate dbAuth Secret',
        task: async () => {
          const { stdout: dbAuthSecret } = await execa(
            'yarn',
            ['rw', 'g', 'secret', '--raw'],
            {
              ...getExecaOptions(OUTPUT_PROJECT_PATH),
              stdio: 'pipe',
            }
          )

          fs.appendFileSync(
            path.join(OUTPUT_PROJECT_PATH, '.env'),
            `SESSION_SECRET=${dbAuthSecret}`
          )
        },
        enabled: () => !rebuildFixture,
      },
      {
        title: 'Running prisma migrate reset',
        task: () => {
          return execa(
            'yarn rw prisma migrate reset',
            ['--force'],
            getExecaOptions(OUTPUT_PROJECT_PATH)
          )
        },
      },
      {
        title: 'All done!',
        task: async (_ctx, task) => {
          if (verbose) {
            // Without verbose these logs aren't visible anyway
            console.log()
            console.log('-'.repeat(30))
            console.log()
            console.log('✅ Success your project has been generated at:')
            console.log(OUTPUT_PROJECT_PATH)
            console.log()
            console.log('-'.repeat(30))
          } else {
            task.output = `Generated project at ${OUTPUT_PROJECT_PATH}`
          }
        },
      },
    ],
    {
      exitOnError: true,
      renderer: verbose && 'verbose',
      renderOptions: { collapseSubtasks: false },
    }
  )

async function runCommand() {
  // confirm usage for case raw build without Link
  if (!copyFromFixture && !link) {
    // if prompt returns 'no', exit
    ;(await confirmNoFixtureNoLink(copyFromFixture, link)) || process.exit(1)
  }

  await globalTasks()
    .run()
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}

runCommand()
