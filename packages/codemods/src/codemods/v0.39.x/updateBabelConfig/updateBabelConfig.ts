import fs from 'fs'
import path from 'path'

import { getPaths } from '@redwoodjs/project-config'

import prettify from '../../../lib/prettify'

export const removeBabelConfig = async () => {
  const rootBabelConfigPath = path.join(getPaths().base, 'babel.config.js')
  const webBabelRcPath = path.join(getPaths().web.base, '.babelrc.js')

  const webBabelConfigPath = path.join(getPaths().web.base, 'babel.config.js')

  // Remove root babel config
  if (fs.existsSync(rootBabelConfigPath)) {
    const rootConfig = require(rootBabelConfigPath)
    // If the rootConfig is the default, we can remove it
    if (
      Object.keys(rootConfig).length === 1 &&
      rootConfig.presets?.[0] === '@redwoodjs/core/config/babel-preset'
    ) {
      console.log('Removing root babel.config.js')
      fs.rmSync(rootBabelConfigPath)
    } else {
      // They have custom config in the root babel.config
      // Fail and ask them to move config manually
      console.warn('Detected custom config in your root babel.config.js')
      throw new Error(
        'Cannot automatically codemod your project. Please move your root babel.config.js settings manually',
      )
    }
  }

  if (fs.existsSync(webBabelRcPath)) {
    const webConfig = require(webBabelRcPath)

    // If its the default .babelrc.js
    if (
      Object.keys(webConfig).length === 1 &&
      webConfig.extends === '../babel.config.js'
    ) {
      console.log('Removing web .babelrc.js')
      fs.rmSync(webBabelRcPath)
    } else {
      // Rename .babelrc to babel.config.js
      fs.rmSync(webBabelRcPath)

      // And remove extends  from the config
      if (webConfig.extends) {
        const { extends: _ignore, ...otherConfig } = webConfig

        const newConfig = `module.exports = ${JSON.stringify(otherConfig)}`

        fs.writeFileSync(webBabelConfigPath, await prettify(newConfig))
      }
    }
  }
}

export default removeBabelConfig
