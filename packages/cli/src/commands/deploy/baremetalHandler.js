import path from 'path'

import toml from '@iarna/toml'
import boxen from 'boxen'
import fs from 'fs-extra'
import { Listr } from 'listr2'
import { env as envInterpolation } from 'string-env-interpolation'
import { titleCase } from 'title-case'

import { recordTelemetryAttributes } from '@redwoodjs/cli-helpers'

import { getPaths } from '../../lib'
import c from '../../lib/colors'
import { exitWithError } from '../../lib/exit'

const CONFIG_FILENAME = 'deploy.toml'
const SYMLINK_FLAGS = '-nsf'
const CURRENT_RELEASE_SYMLINK_NAME = 'current'
const LIFECYCLE_HOOKS = ['before', 'after']
export const DEFAULT_SERVER_CONFIG = {
  port: 22,
  branch: 'main',
  packageManagerCommand: 'yarn',
  monitorCommand: 'pm2',
  sides: ['api', 'web'],
  keepReleases: 5,
}

// force all paths to have forward slashes so that you can deploy to *nix
// systems from a Windows system
const pathJoin = path.posix.join

// Executes a single command via SSH connection. Throws an error and sets
// the exit code with the same code returned from the SSH command.
const sshExec = async (ssh, path, command, args) => {
  let sshCommand = command

  if (args) {
    sshCommand += ` ${args.join(' ')}`
  }

  const result = await ssh.execCommand(sshCommand, {
    cwd: path,
  })

  if (result.code !== 0) {
    const error = new Error(
      `Error while running command \`${command} ${args.join(' ')}\``
    )
    error.exitCode = result.code
    throw error
  }

  return result
}

const throwMissingConfig = (name) => {
  throw new Error(
    `"${name}" config option not set. See https://redwoodjs.com/docs/deployment/baremetal#deploytoml`
  )
}

export const verifyConfig = (config, yargs) => {
  if (!yargs.environment) {
    throw new Error(
      'Must specify an environment to deploy to, ex: `yarn rw deploy baremetal production`'
    )
  }

  if (!config[yargs.environment]) {
    throw new Error(`No servers found for environment "${yargs.environment}"`)
  }

  return true
}

export const verifyServerConfig = (config) => {
  if (!config.host) {
    throwMissingConfig('host')
  }

  if (!config.path) {
    throwMissingConfig('path')
  }

  if (!config.repo) {
    throwMissingConfig('repo')
  }

  return true
}

const symlinkCurrentCommand = async (dir, ssh, path) => {
  return await sshExec(ssh, path, 'ln', [
    SYMLINK_FLAGS,
    dir,
    CURRENT_RELEASE_SYMLINK_NAME,
  ])
}

const restartProcessCommand = async (processName, ssh, serverConfig, path) => {
  return await sshExec(ssh, path, serverConfig.monitorCommand, [
    'restart',
    processName,
  ])
}

export const serverConfigWithDefaults = (serverConfig, yargs) => {
  return {
    ...DEFAULT_SERVER_CONFIG,
    ...serverConfig,
    branch: yargs.branch || serverConfig.branch || DEFAULT_SERVER_CONFIG.branch,
  }
}

export const maintenanceTasks = (status, ssh, serverConfig) => {
  const deployPath = pathJoin(serverConfig.path, CURRENT_RELEASE_SYMLINK_NAME)
  const tasks = []

  if (status === 'up') {
    tasks.push({
      title: `Enabling maintenance page...`,
      task: async () => {
        await sshExec(ssh, deployPath, 'cp', [
          pathJoin('web', 'dist', '200.html'),
          pathJoin('web', 'dist', '200.html.orig'),
        ])
        await sshExec(ssh, deployPath, 'ln', [
          SYMLINK_FLAGS,
          pathJoin('..', 'src', 'maintenance.html'),
          pathJoin('web', 'dist', '200.html'),
        ])
      },
    })

    if (serverConfig.processNames) {
      tasks.push({
        title: `Stopping ${serverConfig.processNames.join(', ')} processes...`,
        task: async () => {
          await sshExec(ssh, serverConfig.path, serverConfig.monitorCommand, [
            'stop',
            serverConfig.processNames.join(' '),
          ])
        },
      })
    }
  } else if (status === 'down') {
    tasks.push({
      title: `Starting ${serverConfig.processNames.join(', ')} processes...`,
      task: async () => {
        await sshExec(ssh, serverConfig.path, serverConfig.monitorCommand, [
          'start',
          serverConfig.processNames.join(' '),
        ])
      },
    })

    if (serverConfig.processNames) {
      tasks.push({
        title: `Disabling maintenance page...`,
        task: async () => {
          await sshExec(ssh, deployPath, 'rm', [
            pathJoin('web', 'dist', '200.html'),
          ])
          await sshExec(ssh, deployPath, 'cp', [
            pathJoin('web', 'dist', '200.html.orig'),
            pathJoin('web', 'dist', '200.html'),
          ])
        },
      })
    }
  }

  return tasks
}

export const rollbackTasks = (count, ssh, serverConfig) => {
  let rollbackCount = 1

  if (parseInt(count) === count) {
    rollbackCount = count
  }

  const tasks = [
    {
      title: `Rolling back ${rollbackCount} release(s)...`,
      task: async () => {
        const currentLink = (
          await sshExec(ssh, serverConfig.path, 'readlink', ['-f', 'current'])
        ).stdout
          .split('/')
          .pop()
        const dirs = (
          await sshExec(ssh, serverConfig.path, 'ls', ['-t'])
        ).stdout
          .split('\n')
          .filter((dirs) => !dirs.match(/current/))

        const deployedIndex = dirs.indexOf(currentLink)
        const rollbackIndex = deployedIndex + rollbackCount

        if (dirs[rollbackIndex]) {
          console.info('Setting symlink')
          await symlinkCurrentCommand(
            dirs[rollbackIndex],
            ssh,
            serverConfig.path
          )
        } else {
          throw new Error(
            `Cannot rollback ${rollbackCount} release(s): ${
              dirs.length - dirs.indexOf(currentLink) - 1
            } previous release(s) available`
          )
        }
      },
    },
  ]

  if (serverConfig.processNames) {
    for (const processName of serverConfig.processNames) {
      tasks.push({
        title: `Restarting ${processName} process...`,
        task: async () => {
          await restartProcessCommand(
            processName,
            ssh,
            serverConfig,
            serverConfig.path
          )
        },
      })
    }
  }

  return tasks
}

const lifecycleTask = (
  lifecycle,
  task,
  skip,
  { serverLifecycle, ssh, cmdPath }
) => {
  if (serverLifecycle[lifecycle]?.[task]) {
    const tasks = []

    for (const command of serverLifecycle[lifecycle][task]) {
      tasks.push({
        title: `${titleCase(lifecycle)} ${task}: \`${command}\``,
        task: async () => {
          await sshExec(ssh, cmdPath, command)
        },
        skip: () => skip,
      })
    }

    return tasks
  }
}

// wraps a given command with any defined before/after lifecycle commands
export const commandWithLifecycleEvents = ({ name, config, skip, command }) => {
  const tasks = []

  tasks.push(lifecycleTask('before', name, skip, config))
  tasks.push({ ...command, skip: () => skip })
  tasks.push(lifecycleTask('after', name, skip, config))

  return tasks.flat().filter((t) => t)
}

export const deployTasks = (yargs, ssh, serverConfig, serverLifecycle) => {
  const cmdPath = pathJoin(serverConfig.path, yargs.releaseDir)
  const config = { yargs, ssh, serverConfig, serverLifecycle, cmdPath }
  const tasks = []

  tasks.push(
    commandWithLifecycleEvents({
      name: 'update',
      config: { ...config, cmdPath: serverConfig.path },
      skip: !yargs.update,
      command: {
        title: `Cloning \`${serverConfig.branch}\` branch...`,
        task: async () => {
          await sshExec(ssh, serverConfig.path, 'git', [
            'clone',
            `--branch=${serverConfig.branch}`,
            `--depth=1`,
            serverConfig.repo,
            yargs.releaseDir,
          ])
        },
      },
    })
  )

  tasks.push(
    commandWithLifecycleEvents({
      name: 'symlinkEnv',
      config,
      skip: !yargs.update,
      command: {
        title: `Symlink .env...`,
        task: async () => {
          await sshExec(ssh, cmdPath, 'ln', [SYMLINK_FLAGS, '../.env', '.env'])
        },
      },
    })
  )

  tasks.push(
    commandWithLifecycleEvents({
      name: 'install',
      config,
      skip: !yargs.install,
      command: {
        title: `Installing dependencies...`,
        task: async () => {
          await sshExec(ssh, cmdPath, serverConfig.packageManagerCommand, [
            'install',
          ])
        },
      },
    })
  )

  tasks.push(
    commandWithLifecycleEvents({
      name: 'migrate',
      config,
      skip: !yargs.migrate || serverConfig?.migrate === false,
      command: {
        title: `DB Migrations...`,
        task: async () => {
          await sshExec(ssh, cmdPath, serverConfig.packageManagerCommand, [
            'rw',
            'prisma',
            'migrate',
            'deploy',
          ])
          await sshExec(ssh, cmdPath, serverConfig.packageManagerCommand, [
            'rw',
            'prisma',
            'generate',
          ])
          await sshExec(ssh, cmdPath, serverConfig.packageManagerCommand, [
            'rw',
            'dataMigrate',
            'up',
          ])
        },
      },
    })
  )

  for (const side of serverConfig.sides) {
    tasks.push(
      commandWithLifecycleEvents({
        name: 'build',
        config,
        skip: !yargs.build,
        command: {
          title: `Building ${side}...`,
          task: async () => {
            await sshExec(ssh, cmdPath, serverConfig.packageManagerCommand, [
              'rw',
              'build',
              side,
            ])
          },
        },
      })
    )
  }

  tasks.push(
    commandWithLifecycleEvents({
      name: 'symlinkCurrent',
      config,
      skip: !yargs.update,
      command: {
        title: `Symlinking current release...`,
        task: async () => {
          await symlinkCurrentCommand(yargs.releaseDir, ssh, serverConfig.path)
        },
        skip: () => !yargs.update,
      },
    })
  )

  if (serverConfig.processNames) {
    for (const processName of serverConfig.processNames) {
      if (yargs.firstRun) {
        tasks.push(
          commandWithLifecycleEvents({
            name: 'restart',
            config,
            skip: !yargs.restart,
            command: {
              title: `Starting ${processName} process for the first time...`,
              task: async () => {
                await sshExec(
                  ssh,
                  serverConfig.path,
                  serverConfig.monitorCommand,
                  [
                    'start',
                    pathJoin(
                      CURRENT_RELEASE_SYMLINK_NAME,
                      'ecosystem.config.js'
                    ),
                    '--only',
                    processName,
                  ]
                )
              },
            },
          })
        )
        tasks.push({
          title: `Saving ${processName} state for future startup...`,
          task: async () => {
            await sshExec(ssh, serverConfig.path, serverConfig.monitorCommand, [
              'save',
            ])
          },
          skip: () => !yargs.restart,
        })
      } else {
        tasks.push(
          commandWithLifecycleEvents({
            name: 'restart',
            config,
            skip: !yargs.restart,
            command: {
              title: `Restarting ${processName} process...`,
              task: async () => {
                await restartProcessCommand(
                  processName,
                  ssh,
                  serverConfig,
                  serverConfig.path
                )
              },
            },
          })
        )
      }
    }
  }

  tasks.push(
    commandWithLifecycleEvents({
      name: 'cleanup',
      config: { ...config, cmdPath: serverConfig.path },
      skip: !yargs.cleanup,
      command: {
        title: `Cleaning up old deploys...`,
        task: async () => {
          // add 2 to skip `current` and start on the keepReleases + 1th release
          const fileStartIndex = serverConfig.keepReleases + 2

          await sshExec(
            ssh,
            serverConfig.path,
            `ls -t | tail -n +${fileStartIndex} | xargs rm -rf`
          )
        },
      },
    })
  )

  return tasks.flat().filter((e) => e)
}

// merges additional lifecycle events into an existing object
const mergeLifecycleEvents = (lifecycle, other) => {
  let lifecycleCopy = JSON.parse(JSON.stringify(lifecycle))

  for (const hook of LIFECYCLE_HOOKS) {
    for (const key in other[hook]) {
      lifecycleCopy[hook][key] = (lifecycleCopy[hook][key] || []).concat(
        other[hook][key]
      )
    }
  }

  return lifecycleCopy
}

export const parseConfig = (yargs, rawConfigToml) => {
  const configToml = envInterpolation(rawConfigToml)
  const config = toml.parse(configToml)
  let envConfig
  const emptyLifecycle = {}

  verifyConfig(config, yargs)

  // start with an empty set of hooks, { before: {}, after: {} }
  for (const hook of LIFECYCLE_HOOKS) {
    emptyLifecycle[hook] = {}
  }

  // global lifecycle config
  let envLifecycle = mergeLifecycleEvents(emptyLifecycle, config)

  // get config for given environment
  envConfig = config[yargs.environment]
  envLifecycle = mergeLifecycleEvents(envLifecycle, envConfig)

  return { envConfig, envLifecycle }
}

export const commands = (yargs, ssh) => {
  const deployConfig = fs
    .readFileSync(pathJoin(getPaths().base, CONFIG_FILENAME))
    .toString()

  let { envConfig, envLifecycle } = parseConfig(yargs, deployConfig)
  let servers = []
  let tasks = []

  // loop through each server in deploy.toml
  for (const config of envConfig.servers) {
    // merge in defaults
    const serverConfig = serverConfigWithDefaults(config, yargs)

    verifyServerConfig(serverConfig)

    // server-specific lifecycle
    const serverLifecycle = mergeLifecycleEvents(envLifecycle, serverConfig)

    tasks.push({
      title: 'Connecting...',
      task: () =>
        ssh.connect({
          host: serverConfig.host,
          port: serverConfig.port,
          username: serverConfig.username,
          password: serverConfig.password,
          privateKey: serverConfig.privateKey,
          privateKeyPath: serverConfig.privateKeyPath,
          passphrase: serverConfig.passphrase,
          agent: serverConfig.agentForward && process.env.SSH_AUTH_SOCK,
          agentForward: serverConfig.agentForward,
        }),
    })

    if (yargs.maintenance) {
      tasks = tasks.concat(
        maintenanceTasks(yargs.maintenance, ssh, serverConfig)
      )
    } else if (yargs.rollback) {
      tasks = tasks.concat(rollbackTasks(yargs.rollback, ssh, serverConfig))
    } else {
      tasks = tasks.concat(
        deployTasks(yargs, ssh, serverConfig, serverLifecycle)
      )
    }

    tasks.push({
      title: 'Disconnecting...',
      task: () => ssh.dispose(),
    })

    // Sets each server as a "parent" task so that the actual deploy tasks
    // run as children. Each server deploy can run concurrently
    servers.push({
      title: serverConfig.host,
      task: () => {
        return new Listr(tasks)
      },
    })
  }

  return servers
}

export async function handler(yargs) {
  recordTelemetryAttributes({
    command: 'deploy baremetal',
    firstRun: yargs.firstRun,
    update: yargs.update,
    install: yargs.install,
    migrate: yargs.migrate,
    build: yargs.build,
    restart: yargs.restart,
    cleanup: yargs.cleanup,
    maintenance: yargs.maintenance,
    rollback: yargs.rollback,
    verbose: yargs.verbose,
  })

  let ssh

  try {
    const { NodeSSH } = await import('node-ssh')
    ssh = new NodeSSH()
  } catch (e) {
    if (e.code !== 'ERR_MODULE_NOT_FOUND') {
      throw e
    }

    exitWithError(undefined, {
      message: [
        "Error: Can't find module `node-ssh`. Have you set up baremetal deploy?",
        '',
        '  yarn rw setup deploy baremetal',
        '',
      ].join('\n'),
      includeEpilogue: false,
    })
  }

  try {
    const tasks = new Listr(commands(yargs, ssh), {
      concurrent: true,
      exitOnError: true,
      renderer: yargs.verbose && 'verbose',
    })
    await tasks.run()
  } catch (e) {
    console.error(c.error('\nDeploy failed:'))
    console.error(
      boxen(e.stderr || e.message, {
        padding: { top: 0, bottom: 0, right: 1, left: 1 },
        margin: 0,
        borderColor: 'red',
      })
    )

    process.exit(e?.exitCode || 1)
  }
}
