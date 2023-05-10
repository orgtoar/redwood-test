import { getConfig } from './lib'
import { installModule } from './lib/packages'

export async function loadCommandModules() {
  const { plugins, autoInstallPackages } = getConfig().cli

  const pluginNames = plugins.map((p) => p.name)
  if (plugins.length !== new Set(pluginNames).size) {
    throw new Error('Duplicate plugin names found in redwood.toml')
  }

  const pluginsNotInstalled = []

  const commandModules = []
  for (const plugin of plugins) {
    try {
      const pluginCommands = (await import(plugin.name)).commands
      commandModules.push(...pluginCommands)
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        pluginsNotInstalled.push(plugin)
        continue
      }
      console.error(`Failed to load plugin "${plugin.name}"`)
      throw e
    }
  }

  if (pluginsNotInstalled.length > 0) {
    console.log(
      `The following plugins are not installed:\n${pluginsNotInstalled
        .map((p) => ` * ${p.name}`)
        .join('\n')}`
    )
    if (autoInstallPackages) {
      console.log('Installing them now...')
      // TODO: Don't install them one by one that's just insanely inefficient
      for (const plugin of pluginsNotInstalled) {
        try {
          await installModule(plugin.name, plugin.version)
          const pluginCommands = (await import(plugin.name)).commands
          commandModules.push(...pluginCommands)
        } catch (error) {
          console.error(`Failed to install plugin "${plugin.name}"`)
          throw error
        }
      }
    } else {
      console.log(
        "You can install them manually as dev dependencies or set 'autoInstallPackages' to true."
      )
    }
  }

  return commandModules
}
