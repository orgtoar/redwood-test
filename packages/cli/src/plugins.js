import { getConfig } from './lib'
import { installModule } from './lib/packages'

function validatePluginList(plugins) {
  const pluginNames = plugins.map((p) => p.name)
  if (plugins.length !== new Set(pluginNames).size) {
    throw new Error('Duplicate plugin names found in redwood.toml')
  }
  const namespaces = plugins.map((p) => p.name.split('/')[0])
  namespaces.forEach((ns) => {
    if (!ns.includes('@')) {
      throw new Error(`Plugin name "${ns}" must be scoped with @`)
    }
  })
}

export async function loadPlugins(yargs) {
  const { plugins, autoInstallPackages } = getConfig().cli

  // Validate plugin list from redwood.toml
  try {
    validatePluginList(plugins)
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }

  // Get a list of all unique namespaces
  const namespaces = Array.from(
    new Set(plugins.map((p) => p.name.split('/')[0]))
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
    namespaceInUse.push('@redwoodjs')
  }

  for (const namespace of namespaceInUse) {
    // Get all the plugins for this namespace
    const namespacedPlugins = plugins.filter((p) =>
      p.name.startsWith(namespace)
    )
    const namespacedCommands = []

    // Load all plugins for this namespace
    for (const namespacedPlugin of namespacedPlugins) {
      let plugin
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
      if (plugin) {
        namespacedCommands.push(...plugin.commands)
      } else {
        console.error(`Failed to load plugin "${namespacedPlugin.name}"`)
      }
    }

    // Register all commands for this namespace
    // If the namespace is @redwoodjs, we don't need to nest the commands under a namespace
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
  }

  return yargs
}
