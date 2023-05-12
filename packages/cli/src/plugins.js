import fs from 'fs'
import path from 'path'

import { getConfig, getPaths } from './lib'
import { installModule } from './lib/packages'

function validatePluginList(plugins) {
  const pluginNames = plugins.map((p) => p.name)
  if (plugins.length !== new Set(pluginNames).size) {
    console.warn(
      'Duplicate plugin names found in redwood.toml, ignoring duplicates...'
    )
  }
  const namespaces = plugins.map((p) => p.name.split('/')[0])
  namespaces.forEach((ns) => {
    if (!ns.includes('@')) {
      console.warn(
        `Plugin name "${ns}" is missing a namespace, it will be ignored...`
      )
    }
  })
}

export async function loadPlugins(yargs) {
  console.log(`> memory: `, process.memoryUsage().rss / 1024 / 1024, 'MB')
  console.time('Plugin loading')
  const { plugins, autoInstallPackages } = getConfig().cli

  // TODO: Remove this when we make the full switch to a total plugin based CLI
  // If we don't have any plugins in the toml file, add all the @redwoodjs plugins
  if (plugins.length === 0) {
    plugins.push({
      name: '@redwoodjs/cli-plugin-generators',
      version: 'canary',
    })
  }

  // Validate plugin list from redwood.toml
  try {
    console.time('Plugin validation')
    validatePluginList(plugins)
    console.timeEnd('Plugin validation')
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }

  // Get a list of all unique namespaces, sorted alphabetically with @redwoodjs first
  console.time('Plugin namespacing')
  const namespaces = Array.from(
    new Set([
      ...plugins
        .filter((p) => p.name.startsWith('@redwoodjs/'))
        .map((p) => p.name.split('/')[0])
        .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0)),
      ...plugins
        .filter((p) => !p.name.startsWith('@redwoodjs/'))
        .map((p) => p.name.split('/')[0])
        .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0)),
    ])
  )

  // If the user is running a help command or no command was given
  // we want to load all plugins for observability in the help output
  const processArgv = process.argv.slice(2).join(' ')
  const loadAllPlugins =
    processArgv === '--help' || processArgv === '-h' || processArgv === ''

  // Filter the namespaces based on the command line args to
  // reduce the number of plugins we need to load
  const namespaceInUse = namespaces.filter(
    (ns) => loadAllPlugins || processArgv.includes(ns)
  )
  if (namespaceInUse.length === 0) {
    // If no namespace is in use we're using the default @redwoodjs namespace
    namespaceInUse.unshift('@redwoodjs')
  }
  console.timeEnd('Plugin namespacing')

  // TODO: This cache should really be fetched from an online source
  //       so that we don't have an automatic cache miss the first time
  //       a user runs a command.
  //       We should probably have some sort of `rw add` or `rw register`
  //       command that will add a plugin to the toml and at that time
  //       we can fetch the cache from the online source.

  console.time('Reading plugin cache')
  let pluginCommandCache = {}
  try {
    pluginCommandCache = JSON.parse(
      fs.readFileSync(path.join(getPaths().generated.base, 'cli.cache'))
    )
  } catch (_error) {
    // console.log(error)
    // No need to log this error, it's just a cache miss
  }
  console.timeEnd('Reading plugin cache')

  const firstWord = processArgv.split(' ')[0]
  for (const namespace of namespaceInUse) {
    // Get all the plugins for this namespace
    const namespacedPlugins = new Set(
      plugins.filter((p) => p.name.startsWith(namespace))
    )
    const namespacedCommands = []

    // Load all plugins for this namespace
    for (const namespacedPlugin of namespacedPlugins) {
      // Check the cache to see if we can skip loading this plugin
      console.time(`Checking cache for ${namespacedPlugin.name}`)
      const cacheEntry = pluginCommandCache[namespacedPlugin.name]
      if (cacheEntry && !loadAllPlugins) {
        // If this plugin doesn't have a command that matches the first word
        // we can skip loading it
        if (!cacheEntry.includes(firstWord)) {
          continue
        }
      }
      console.timeEnd(`Checking cache for ${namespacedPlugin.name}`)

      let plugin
      console.time(`Package import: ${namespacedPlugin.name}`)
      try {
        plugin = await import(namespacedPlugin.name)
      } catch (error) {
        // TODO: Preload all plugins so we can install all missing in one go
        if (error.code === 'MODULE_NOT_FOUND' && autoInstallPackages) {
          console.log(`Installing plugin "${namespacedPlugin.name}"...`)
          // Install the plugin
          await installModule(namespacedPlugin.name, namespacedPlugin.version)
          plugin = await import(namespacedPlugin.name)
        }
      }

      // Add the plugin to the cache
      pluginCommandCache[namespacedPlugin.name] = []
      for (const command of plugin.commands) {
        // Add the first word of the command to the cache
        pluginCommandCache[namespacedPlugin.name].push(
          command.command.split(' ')[0]
        )
        // Add any aliases of the command to the cache
        pluginCommandCache[namespacedPlugin.name].push(
          ...(command.aliases || [])
        )
      }

      // Add these commands to the namespace list
      console.timeEnd(`Package import: ${namespacedPlugin.name}`)
      console.log(`> memory: `, process.memoryUsage().rss / 1024 / 1024, 'MB')
      if (plugin) {
        namespacedCommands.push(...plugin.commands)
      } else {
        console.error(`Failed to load plugin "${namespacedPlugin.name}"`)
      }
    }

    // Register all commands for this namespace
    // If the namespace is @redwoodjs, we don't need to nest the commands under a namespace
    console.time('Registering commands')
    if (namespace === '@redwoodjs') {
      yargs.command(namespacedCommands)
    } else {
      yargs.command({
        command: `${namespace} <command>`,
        describe: `${namespace} plugins`,
        builder: (yargs) => {
          yargs.command(namespacedCommands)
        },
        handler: () => {},
      })
    }
    console.timeEnd('Registering commands')
  }

  // Cache the plugin-command mapping to optimise loading on the
  // next invocation
  console.time('Writing plugin cache')
  try {
    fs.writeFileSync(
      path.join(getPaths().generated.base, 'cli.cache'),
      JSON.stringify(pluginCommandCache)
    )
  } catch (_error) {
    // console.error(error)
    // No need to log this error, it's not critical to cache
  }
  console.timeEnd('Writing plugin cache')

  console.timeEnd('Plugin loading')
  console.log(`> memory: `, process.memoryUsage().rss / 1024 / 1024, 'MB')
  console.log('-'.repeat(60) + '\n')
  return yargs
}
