import { getConfig } from '../../lib'

export const handler = async ({ _force, name, _version }) => {
  const installedPlugins = getConfig().cli.plugins.map((plugin) => plugin.name)
  const pluginsToUpdate = []

  if (name !== undefined) {
    if (!installedPlugins.includes(name)) {
      console.log(`Plugin "${name}" is not installed.`)
      return
    }
    pluginsToUpdate.push(name)
  } else {
    pluginsToUpdate.push(...installedPlugins)
  }

  // TODO: Log which plugins we'll be updating

  // TODO: For each plugin
  //       - Log the plugin name
  //       - Fetch the latest version of the plugin that is compatible with the
  //         current version of Redwood from the plugin API
  //       - If a version was specified, check if it's compatible and use it
  //       - Update the toml with the new version, if it's different
  //       - Install the plugin, if it's not lazy loaded
}
