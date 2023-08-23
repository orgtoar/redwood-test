import fs from 'fs'
import path from 'path'

import type { PluginItem, TransformOptions } from '@babel/core'

import { getPaths } from '@redwoodjs/project-config'

import { getWebSideBabelPlugins } from './web'

const packageJSON = require('../package.json')

export interface RegisterHookOptions {
  plugins?: PluginItem[]
  overrides?: TransformOptions['overrides']
}

interface BabelRegisterOptions extends TransformOptions {
  extensions?: string[]
  cache?: boolean
}

// We do this so we still get types, but don't import babel/register
// Importing babel/register in typescript (instead of requiring) has dire consequences..

// Lets say we use the import syntax: import babelRequireHook from '@babel/register'...
// - if your import in a JS file (like we used to in the cli project) - not a problem, and it would only invoke the register function when you called babelRequireHook
// - if you import in a TS file, the transpile process modifies it when we build the framework -
//   so it will invoke it once as soon as you import, and another time when you use babelRequireHook...
//   BUTTT!!! you won't notice it if your project is TS because by default it ignore .ts and .tsx files, but if its a JS project, it would try to transpile twice
export const registerBabel = (options: BabelRegisterOptions) => {
  require('@babel/register')(options)
}

// Use the version of core-js up to the minor (e.g. 3.6 instead of 3)
// to include the features added in the minor.
// See https://github.com/zloirock/core-js/blob/master/README.md#babelpreset-env.
export const CORE_JS_VERSION = packageJSON.dependencies['core-js']
  .split('.')
  .slice(0, 2)
  .join('.')

export const RUNTIME_CORE_JS_VERSION =
  packageJSON.dependencies['@babel/runtime-corejs3']

// Note: The private method loose mode configuration setting must be the
// same as @babel/plugin-proposal class-properties.
// (https://babeljs.io/docs/en/babel-plugin-proposal-private-methods#loose)
export const getCommonPlugins = () => {
  return [
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
  ]
}

// TODO (STREAMING) double check this, think about it more carefully please!
// It's related to yarn workspaces to be or not to be
export const getRouteHookBabelPlugins = () => {
  return [
    ...getWebSideBabelPlugins({
      forVite: true,
    }),
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          'api/src': './src',
        },
        root: [getPaths().api.base],
        cwd: 'packagejson',
        loglevel: 'silent', // to silence the unnecessary warnings
      },
      'rwjs-api-module-resolver',
    ],
  ]
}

/**
 * Finds and parses the ts config file (tsconfig.json or jsconfig.json).
 */
export function parseTypeScriptConfigFiles() {
  const redwoodProjectPaths = getPaths()

  const apiConfig = parseTypeScriptConfigFile(redwoodProjectPaths.api.base)
  const webConfig = parseTypeScriptConfigFile(redwoodProjectPaths.web.base)

  return {
    api: apiConfig,
    web: webConfig,
  }
}

function parseTypeScriptConfigFile(basePath: string) {
  let configPath = path.join(basePath, 'tsconfig.json')

  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }

  configPath = path.join(basePath, 'jsconfig.json')

  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }

  return null
}

/**
 * Gets and formats paths from the TypeScript config.
 */
export function getPathsFromTypeScriptConfig(config: {
  compilerOptions: { baseUrl: string; paths: string }
}): Record<string, string> {
  if (!config?.compilerOptions?.baseUrl || !config?.compilerOptions?.paths) {
    return {}
  }

  const { baseUrl, paths } = config.compilerOptions

  const pathsObj: Record<string, string> = {}
  for (const [key, value] of Object.entries(paths)) {
    // Exclude the default paths that are included in the tsconfig.json file:
    // - "src/*"
    // - "$api/*"
    // - "types/*"
    // - "@redwoodjs/testing"
    if (key.match(/src\/|\$api\/\*|types\/\*|\@redwoodjs\/.*/g)) {
      continue
    }

    const aliasKey = key.replace('/*', '')
    const aliasValue = path.join(
      baseUrl,
      (value as string)[0].replace('/*', '')
    )

    pathsObj[aliasKey] = aliasValue
  }

  return pathsObj
}
