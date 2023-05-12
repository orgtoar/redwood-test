import { getConfig } from '../../lib'

const { AutoComplete } = require('enquirer')

export const handler = async ({ _force, name }) => {
  const installedPlugins = getConfig().cli.plugins.map((plugin) => plugin.name)
  if (name === undefined) {
    // TODO: Fetch the currently plugins from the toml
    const prompt = new AutoComplete({
      name: 'plugin',
      message: 'Select a plugin to remove',
      choices: installedPlugins,
      limit: 10,
    })
    name = await prompt.run()
  }

  if (!installedPlugins.includes(name)) {
    console.log(`Plugin "${name}" is not installed`)
    return
  }

  // TODO: Remove from the toml
  // TODO: Check if the package is installed and remove it if it is
}
