import fs from 'fs'
import path from 'path'

import { transform, transformFileSync } from '@babel/core'
import type { PluginItem, TransformOptions } from '@babel/core'

import { getPaths, getConfig } from '@redwoodjs/project-config'

import {
  registerBabel,
  RegisterHookOptions,
  CORE_JS_VERSION,
  RUNTIME_CORE_JS_VERSION,
  parseTypeScriptConfigFiles,
  getPathsFromTypeScriptConfig,
} from './common'

export const TARGETS_NODE = '18.16'

export const BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS = {
  // See https://babeljs.io/docs/babel-plugin-transform-runtime/#corejs
  // and https://babeljs.io/docs/en/babel-plugin-transform-runtime/#core-js-aliasing.
  //
  // This results in over polyfilling.
  corejs: { version: 3, proposals: true },

  // See https://babeljs.io/docs/en/babel-plugin-transform-runtime/#version.
  version: RUNTIME_CORE_JS_VERSION,
}

export const getApiSideBabelPresets = (
  { presetEnv } = { presetEnv: false }
) => {
  return [
    '@babel/preset-typescript',

    // `@babel/preset-env` is required when we aren't transpiling with esbuild.
    // Namely, for console, exec, and jest.
    presetEnv && [
      '@babel/preset-env',
      {
        targets: {
          node: TARGETS_NODE,
        },
        useBuiltIns: 'usage',
        corejs: {
          version: CORE_JS_VERSION,
          // List of supported proposals: https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md#ecmascript-proposals.
          proposals: true,
        },
      },
    ],
  ].filter(Boolean) as TransformOptions['presets']
}

export const getApiSideBabelPlugins = (
  { openTelemetry } = {
    openTelemetry: false,
  }
) => {
  const tsConfig = parseTypeScriptConfigFiles()

  const plugins: TransformOptions['plugins'] = [
    ['@babel/plugin-transform-runtime', BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS],

    [
      'babel-plugin-module-resolver',
      {
        alias: {
          src: './src',
          // adds the paths from [ts|js]config.json to the module resolver
          ...getPathsFromTypeScriptConfig(tsConfig.api),
        },
        root: [getPaths().api.base],
        cwd: 'packagejson',
        loglevel: 'silent', // to silence the unnecessary warnings
      },
      'rwjs-api-module-resolver',
    ],

    [
      require('./plugins/babel-plugin-redwood-directory-named-import').default,
      undefined,
      'rwjs-babel-directory-named-modules',
    ],

    [
      'babel-plugin-auto-import',
      {
        declarations: [
          {
            default: 'gql',
            path: 'graphql-tag',
          },
          {
            members: ['context'],
            path: '@redwoodjs/graphql-server',
          },
        ],
      },
      'rwjs-babel-auto-import',
    ],

    // FIXME: `graphql-tag` isn't working: https://github.com/redwoodjs/redwood/pull/3193
    ['babel-plugin-graphql-tag', undefined, 'rwjs-babel-graphql-tag'],

    [
      require('./plugins/babel-plugin-redwood-import-dir').default,
      undefined,
      'rwjs-babel-glob-import-dir',
    ],

    openTelemetry && [
      require('./plugins/babel-plugin-redwood-otel-wrapping').default,
      undefined,
      'rwjs-babel-otel-wrapping',
    ],
  ].filter(Boolean) as PluginItem[]

  return plugins
}

export function getApiSideBabelConfigPath(): string | undefined {
  const apiSideBabelConfigPath = path.join(
    getPaths().api.base,
    'babel.config.js'
  )

  return fs.existsSync(apiSideBabelConfigPath)
    ? apiSideBabelConfigPath
    : undefined
}

export function getApiSideDefaultBabelConfig() {
  return {
    presets: getApiSideBabelPresets(),
    plugins: getApiSideBabelPlugins({
      openTelemetry: getConfig().experimental.opentelemetry.enabled,
    }),
    extends: getApiSideBabelConfigPath(),
    babelrc: false,
    ignore: ['node_modules'],
  }
}

// Used in CLI commands that need to transpile on the fly.
export function registerApiSideBabelHook({
  plugins = [],
  ...rest
}: RegisterHookOptions = {}) {
  const apiSideDefaultOptions = getApiSideDefaultBabelConfig()

  registerBabel({
    ...apiSideDefaultOptions,
    presets: getApiSideBabelPresets({
      presetEnv: true,
    }),
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    plugins: [...apiSideDefaultOptions.plugins, ...plugins],
    cache: false,
    ...rest,
  })
}

export function prebuildApiFile(
  srcPath: string,
  distPath: string,
  apiSideBabelConfig = getApiSideDefaultBabelConfig()
) {
  return transformFileSync(srcPath, {
    ...apiSideBabelConfig,

    cwd: getPaths().api.base,
    filename: srcPath,
    sourceFileName: path.relative(path.dirname(distPath), srcPath),

    // We need to inline the sourcemaps because this file will eventually be fed to esbuild.
    // When esbuild finds an inline sourcemap, it tries to "combine" it
    // so that the final sourcemap has both mappings.
    sourceMaps: 'inline',
  })
}

// TODO (STREAMING) I changed the prebuildApiFile function in https://github.com/redwoodjs/redwood/pull/7672/files
// but we had to revert. For this branch temporarily, I'm going to add a new function
// This is used in building routeHooks
export const transformWithBabel = (
  srcPath: string,
  plugins: TransformOptions['plugins']
) => {
  const code = fs.readFileSync(srcPath, 'utf-8')
  const defaultOptions = getApiSideDefaultBabelConfig()

  const result = transform(code, {
    ...defaultOptions,
    cwd: getPaths().api.base,
    filename: srcPath,
    // we need inline sourcemaps at this level
    // because this file will eventually be fed to esbuild
    // when esbuild finds an inline sourcemap, it tries to "combine" it
    // so the final sourcemap (the one that esbuild generates) combines both mappings
    sourceMaps: 'inline',
    plugins,
  })
  return result
}
