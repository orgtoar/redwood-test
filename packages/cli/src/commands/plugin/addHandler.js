const { AutoComplete } = require('enquirer')

export const handler = async ({ _force, name, _version }) => {
  if (name === undefined) {
    // TODO: Fetch the latest plugin package list from the plugin API
    const pluginList = [
      '@redwoodjs/cli-plugin-generator',
      '@joshgmw/rw-plugin-one',
    ]
    const prompt = new AutoComplete({
      name: 'plugin',
      message: 'Select a plugin to install',
      choices: pluginList,
      limit: 10,
    })
    name = await prompt.run()
  }

  // TODO: Check if the plugin is already installed

  // TODO: Handle if version is not specified
  // TODO: Get the latest version of the plugin that is compatible with the
  // current version of Redwood from the plugin API

  // TODO: Install the plugin

  // TODO: Fetch the plugin cache entry from the plugin API
}
