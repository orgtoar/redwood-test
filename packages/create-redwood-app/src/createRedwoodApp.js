import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { trace, SpanStatusCode } from '@opentelemetry/api'
import execa from 'execa'
import fs from 'fs-extra'
import semver from 'semver'
import terminalLink from 'terminal-link'
import untildify from 'untildify'
import { hideBin, Parser } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import {
  RedwoodTUI,
  ReactiveTUIContent,
  RedwoodStyling as styles,
} from '@redwoodjs/tui'

import { name, version } from '../package.json'

import {
  checkNodeVersion,
  INITIAL_COMMIT_MESSAGE,
  USE_GITPOD_TEXT,
} from './lib'
import {
  UID,
  startTelemetry,
  shutdownTelemetry,
  recordErrorViaTelemetry,
} from './telemetry.js'

// Telemetry
const { telemetry } = Parser(hideBin(process.argv))

const tui = new RedwoodTUI()

async function executeCompatibilityCheck(templateDir) {
  const tuiContent = new ReactiveTUIContent({
    mode: 'text',
    content: 'Checking node compatibility',
    spinner: {
      enabled: true,
    },
  })
  tui.startReactive(tuiContent)

  const [checksPassed, checksData] = await checkNodeVersion(templateDir)

  if (checksPassed) {
    tuiContent.update({
      spinner: {
        enabled: false,
      },
      content: `${styles.green('✔')} Compatibility checks passed`,
    })
    tui.stopReactive()

    return
  }

  if (!checksPassed) {
    const foundNodeVersionIsLessThanRequired = semver.lt(
      checksData.node.version.version,
      semver.minVersion(checksData.node.wanted.raw)
    )

    if (foundNodeVersionIsLessThanRequired) {
      tui.stopReactive(true)
      tui.displayError(
        'Compatibility checks failed',
        [
          `  You need to upgrade the version of node you're using.`,
          `  You're using ${checksData.node.version.version} and we currently support node ${checksData.node.wanted.range}.`,
          '',
          `  Please use tools like nvm or corepack to change to a compatible version.`,
          `  See: ${terminalLink(
            'How to - Using nvm',
            'https://redwoodjs.com/docs/how-to/using-nvm',
            {
              fallback: () =>
                'How to - Using nvm https://redwoodjs.com/docs/how-to/using-nvm',
            }
          )}`,
          `  See: ${terminalLink(
            'Tutorial - Prerequisites',
            'https://redwoodjs.com/docs/tutorial/chapter1/prerequisites',
            {
              fallback: () =>
                'Tutorial - Prerequisites https://redwoodjs.com/docs/tutorial/chapter1/prerequisites',
            }
          )}`,
          '',
          ...USE_GITPOD_TEXT,
        ].join('\n')
      )

      recordErrorViaTelemetry('Compatibility checks failed')
      await shutdownTelemetry()
      process.exit(1)
    }

    tui.stopReactive(true)
    tui.displayWarning(
      'Compatibility checks failed',
      [
        `  You may want to downgrade the version of node you're using.`,
        `  You're using ${checksData.node.version.version} and we currently support node ${checksData.node.wanted.range}.`,
        '',
        `  This may make your project incompatible with some deploy targets, especially those using AWS Lambdas.`,
        '',
        `  Please use tools like nvm or corepack to change to a compatible version.`,
        `  See: ${terminalLink(
          'How to - Use nvm',
          'https://redwoodjs.com/docs/how-to/using-nvm',
          {
            fallback: () =>
              'How to - Use nvm https://redwoodjs.com/docs/how-to/using-nvm',
          }
        )}`,
        `  See: ${terminalLink(
          'Tutorial - Prerequisites',
          'https://redwoodjs.com/docs/tutorial/chapter1/prerequisites',
          {
            fallback: () =>
              'Tutorial - Prerequisites https://redwoodjs.com/docs/tutorial/chapter1/prerequisites',
          }
        )}`,
        '',
        ...USE_GITPOD_TEXT,
      ].join('\n')
    )

    // Try catch for handling if the user cancels the prompt.
    try {
      const response = await tui.prompt({
        type: 'select',
        name: 'override-engine-error',
        message: 'How would you like to proceed?',
        choices: ['Override error and continue install', 'Quit install'],
        initial: 0,
      })
      if (response['override-engine-error'] === 'Quit install') {
        recordErrorViaTelemetry('User quit after engine check error')
        await shutdownTelemetry()
        process.exit(1)
      }
    } catch (error) {
      recordErrorViaTelemetry('User cancelled install at engine check error')
      await shutdownTelemetry()
      process.exit(1)
    }
  }
}

async function createProjectFiles(appDir, { templateDir, overwrite }) {
  let newAppDir = appDir

  const tuiContent = new ReactiveTUIContent({
    mode: 'text',
    content: 'Creating project files',
    spinner: {
      enabled: true,
    },
  })
  tui.startReactive(tuiContent)

  newAppDir = await doesDirectoryAlreadyExist(newAppDir, { overwrite })

  // Ensure the new app directory exists
  fs.ensureDirSync(path.dirname(newAppDir))

  // Copy the template files to the new app directory
  fs.copySync(templateDir, newAppDir, { overwrite })

  // .gitignore is renamed here to force file inclusion during publishing
  fs.rename(
    path.join(newAppDir, 'gitignore.template'),
    path.join(newAppDir, '.gitignore')
  )

  // Write the uid
  fs.ensureDirSync(path.join(newAppDir, '.redwood'))
  fs.writeFileSync(path.join(newAppDir, '.redwood', 'telemetry.txt'), UID)

  tuiContent.update({
    spinner: {
      enabled: false,
    },
    content: `${styles.green('✔')} Project files created`,
  })
  tui.stopReactive()

  return newAppDir
}

async function initializeGit(newAppDir, commitMessage) {
  const tuiContent = new ReactiveTUIContent({
    mode: 'text',
    content: 'Initializing a git repo',
    spinner: {
      enabled: true,
    },
  })
  tui.startReactive(tuiContent)

  const gitSubprocess = execa(
    `git init && git add . && git commit -m "${commitMessage}"`,
    {
      shell: true,
      cwd: newAppDir,
    }
  )

  try {
    await gitSubprocess
  } catch (error) {
    tui.stopReactive(true)
    tui.displayError(
      "Couldn't initialize a git repo",
      [
        `We could not initialize a git repo using ${styles.info(
          `git init && git add . && git commit -m "${commitMessage}"`
        )}. Please see below for the full error message.`,
        '',
        error,
      ].join('\n')
    )
    recordErrorViaTelemetry(error)
    await shutdownTelemetry()
    process.exit(1)
  }

  tuiContent.update({
    content: `${styles.green(
      '✔'
    )} Initialized a git repo with commit message "${commitMessage}"`,
    spinner: {
      enabled: false,
    },
  })
  tui.stopReactive()
}

async function handleTargetDirPreference(targetDir) {
  if (targetDir) {
    tui.drawText(
      `${styles.green(
        '✔'
      )} Creating your Redwood app in ${targetDir} based on command line argument`
    )

    return targetDir
  }

  // Prompt user for preference
  try {
    const response = await tui.prompt({
      type: 'input',
      name: 'targetDir',
      message: 'Where would you like to create your Redwood app?',
      initial: 'my-redwood-app',
    })

    if (/^~\w/.test(response.targetDir)) {
      tui.stopReactive(true)
      tui.displayError(
        'The `~username` syntax is not supported here',
        'Please use the full path or specify the target directory on the command line.'
      )

      recordErrorViaTelemetry('Target dir prompt path syntax not supported')
      await shutdownTelemetry()
      process.exit(1)
    }

    return untildify(response.targetDir)
  } catch {
    recordErrorViaTelemetry('User cancelled install at target dir prompt')
    await shutdownTelemetry()
    process.exit(1)
  }
}

async function handleTypescriptPreference(typescriptFlag) {
  // Handle case where flag is set
  if (typescriptFlag !== null) {
    tui.drawText(
      `${styles.green('✔')} Using ${
        typescriptFlag ? 'TypeScript' : 'JavaScript'
      } based on command line flag`
    )
    return typescriptFlag
  }

  // Prompt user for preference
  try {
    const response = await tui.prompt({
      type: 'Select',
      name: 'language',
      choices: ['TypeScript', 'JavaScript'],
      message: 'Select your preferred language',
      initial: 'TypeScript',
    })
    return response.language === 'TypeScript'
  } catch (_error) {
    recordErrorViaTelemetry('User cancelled install at language prompt')
    await shutdownTelemetry()
    process.exit(1)
  }
}

async function handleGitPreference(gitInitFlag) {
  // Handle case where flag is set
  if (gitInitFlag !== null) {
    tui.drawText(
      `${styles.green('✔')} ${
        gitInitFlag ? 'Will' : 'Will not'
      } initialize a git repo based on command line flag`
    )
    return gitInitFlag
  }

  // Prompt user for preference
  try {
    const response = await tui.prompt({
      type: 'Toggle',
      name: 'git',
      message: 'Do you want to initialize a git repo?',
      enabled: 'Yes',
      disabled: 'no',
      initial: 'Yes',
    })
    return response.git
  } catch (_error) {
    recordErrorViaTelemetry('User cancelled install at git prompt')
    await shutdownTelemetry()
    process.exit(1)
  }
}

async function doesDirectoryAlreadyExist(
  appDir,
  { overwrite, suppressWarning }
) {
  let newAppDir = appDir

  // Check if the new app directory already exists
  if (fs.existsSync(newAppDir) && !overwrite) {
    // Check if the directory contains files and show an error if it does
    if (fs.readdirSync(newAppDir).length > 0) {
      const styledAppDir = styles.info(newAppDir)

      if (!suppressWarning) {
        tui.stopReactive(true)
        tui.displayWarning(
          'Project directory already contains files',
          [`'${styledAppDir}' already exists and is not empty`].join('\n')
        )
      }

      try {
        const response = await tui.prompt({
          type: 'select',
          name: 'projectDirectoryAlreadyExists',
          message: 'How would you like to proceed?',
          choices: [
            'Quit install',
            `Overwrite files in '${styledAppDir}' and continue install`,
            'Specify a different directory',
          ],
          initial: 0,
        })

        // overwrite the existing files
        if (
          response.projectDirectoryAlreadyExists ===
          `Overwrite files in '${styledAppDir}' and continue install`
        ) {
          // blow away the existing directory and create a new one
          await fs.remove(newAppDir)
        } // specify a different directory
        else if (
          response.projectDirectoryAlreadyExists ===
          'Specify a different directory'
        ) {
          const newDirectoryName = await handleNewDirectoryNamePreference()

          if (/^~\w/.test(newDirectoryName)) {
            tui.stopReactive(true)
            tui.displayError(
              'The `~username` syntax is not supported here',
              'Please use the full path or specify the target directory on the command line.'
            )

            // Calling doesDirectoryAlreadyExist again with the same old
            // appDir as a way to prompt the user for a new directory name
            // after displaying the error above
            newAppDir = await doesDirectoryAlreadyExist(appDir, {
              overwrite,
              suppressWarning: true,
            })
          } else {
            newAppDir = path.resolve(process.cwd(), untildify(newDirectoryName))
          }

          // check to see if the new directory exists
          newAppDir = await doesDirectoryAlreadyExist(newAppDir, { overwrite })
        } // Quit Install and Throw and Error
        else if (response.projectDirectoryAlreadyExists === 'Quit install') {
          // quit and throw an error
          recordErrorViaTelemetry(
            'User quit after directory already exists error'
          )
          await shutdownTelemetry()
          process.exit(1)
        }
        // overwrite the existing files
      } catch (_error) {
        recordErrorViaTelemetry(
          `User cancelled install after directory already exists error`
        )
        await shutdownTelemetry()
        process.exit(1)
      }
    }
  }

  return newAppDir
}

async function handleNewDirectoryNamePreference() {
  try {
    const response = await tui.prompt({
      type: 'input',
      name: 'targetDirectoryInput',
      message: 'What directory would you like to create the app in?',
      initial: 'my-redwood-app',
    })
    return response.targetDirectoryInput
  } catch (_error) {
    recordErrorViaTelemetry(
      'User cancelled install at specify a different directory prompt'
    )
    await shutdownTelemetry()
    process.exit(1)
  }
}

/**
 * @param {string?} commitMessageFlag
 */
async function handleCommitMessagePreference(commitMessageFlag) {
  // Handle case where flag is set
  if (commitMessageFlag !== null) {
    return commitMessageFlag
  }

  // Prompt user for preference
  try {
    const response = await tui.prompt({
      type: 'input',
      name: 'commitMessage',
      message: 'Enter a commit message',
      initial: INITIAL_COMMIT_MESSAGE,
    })
    return response.commitMessage
  } catch (_error) {
    recordErrorViaTelemetry('User cancelled install at commit message prompt')
    await shutdownTelemetry()
    process.exit(1)
  }
}

async function main() {
  const cli = yargs(hideBin(process.argv))
    .scriptName(name)
    .usage('Usage: $0 <project directory> [options]')
    .example('$0 my-redwood-app')
    // .strict()
    .version(version)

  cli
    // .positional('project-directory', {
    //   type: 'string',
    //   default: null,
    //   description: 'Path to the new redwood app',
    // })
    .option('commit-message', {
      alias: 'm',
      default: null,
      type: 'string',
      description: 'Commit message for the initial commit.',
    })
    .option('git-init', {
      alias: 'git',
      default: null,
      type: 'boolean',
      description: 'Initialize a git repository.',
    })
    .option('overwrite', {
      default: false,
      type: 'boolean',
      description: "Create even if target directory isn't empty",
    })
    .option('telemetry', {
      default: true,
      type: 'boolean',
      description:
        'Enables sending telemetry events for this create command and all Redwood CLI commands https://telemetry.redwoodjs.com',
    })
    .option('typescript', {
      alias: 'ts',
      default: null,
      type: 'boolean',
      description: 'Generate a TypeScript project.',
    })
    .option('yes', {
      alias: 'y',
      default: null,
      type: 'boolean',
      description: 'Skip prompts and use defaults.',
    })

  const options = cli.parse()

  tui.drawText(
    [
      `${styles.redwood('-'.repeat(66))}`,
      `${' '.repeat(16)}🌲⚡️ ${styles.header('Welcome to RedwoodJS!')} ⚡️🌲`,
      `${styles.redwood('-'.repeat(66))}`,
    ].join('\n')
  )

  // console.dir(options, { depth: null })

  const templatesDir = fileURLToPath(new URL('../templates', import.meta.url))

  await executeCompatibilityCheck(path.join(templatesDir, 'ts'))

  const args = options._
  let targetDir = String(args).replace(/,/g, '-')
  targetDir = await handleTargetDirPreference(targetDir)

  const typescriptFlag = options.typescript ?? options.yes
  const overwrite = options.overwrite
  // telemetry, // Extracted above to check if telemetry is disabled before we even reach this point
  const gitInitFlag = options['git-init'] ?? options.yes
  const commitMessageFlag =
    options['commit-message'] ?? (options.yes ? INITIAL_COMMIT_MESSAGE : null)

  // Record some of the arguments for telemetry
  trace.getActiveSpan()?.setAttribute('overwrite', overwrite)

  // Determine ts/js preference
  const useTypescript = await handleTypescriptPreference(typescriptFlag)
  trace.getActiveSpan()?.setAttribute('typescript', useTypescript)

  const templateDir = path.join(templatesDir, useTypescript ? 'ts' : 'js')

  // Determine git preference
  const useGit = await handleGitPreference(gitInitFlag)
  trace.getActiveSpan()?.setAttribute('git', useGit)

  /** @type {string} */
  let commitMessage
  if (useGit) {
    commitMessage = await handleCommitMessagePreference(commitMessageFlag)
  }

  let newAppDir = path.resolve(process.cwd(), targetDir)

  // Create project files
  // if this directory already exists then createProjectFiles may set a new directory name
  newAppDir = await createProjectFiles(newAppDir, { templateDir, overwrite })

  // Initialize git repo
  if (useGit) {
    await initializeGit(newAppDir, commitMessage)
  }

  // Post install message
  tui.drawText(
    [
      '',
      styles.success('Thanks for trying out Redwood!'),
      '',
      ` ⚡️ ${styles.redwood(
        'Get up and running fast with this Quick Start guide'
      )}: https://redwoodjs.com/quick-start`,
      '',
      `${styles.header(`Fire it up!`)} 🚀`,
      '',
      ...[
        `${styles.redwood(
          ` > ${styles.green(`cd ${path.relative(process.cwd(), newAppDir)}`)}`
        )}`,
        `${styles.redwood(` > ${styles.green(`yarn install`)}`)}`,
        `${styles.redwood(` > ${styles.green(`yarn rw dev`)}`)}`,
      ].filter(Boolean),
      '',
    ].join('\n')
  )
}

// Conditionally start telemetry
if (telemetry !== 'false' && !process.env.REDWOOD_DISABLE_TELEMETRY) {
  try {
    await startTelemetry()
  } catch (error) {
    console.error('Telemetry startup error')
    console.error(error)
  }
}

// Execute create redwood app within a span
const tracer = trace.getTracer('redwoodjs')
await tracer.startActiveSpan('create-redwood-app', async (span) => {
  await main()

  // Span housekeeping
  span?.setStatus({ code: SpanStatusCode.OK })
  span?.end()
})

// Shutdown telemetry, ensures data is sent before the process exits
try {
  await shutdownTelemetry()
} catch (error) {
  console.error('Telemetry shutdown error')
  console.error(error)
}
