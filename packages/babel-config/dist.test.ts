import path from 'path'

const distPath = path.join(__dirname, 'dist')

describe('dist', () => {
  it('exports', async () => {
    const mod = await import(path.join(distPath, 'index.js'))

    expect(mod).toMatchInlineSnapshot(`
      {
        "BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS": {
          "corejs": {
            "proposals": true,
            "version": 3,
          },
          "version": "7.23.5",
        },
        "CORE_JS_VERSION": "3.33",
        "RUNTIME_CORE_JS_VERSION": "7.23.5",
        "TARGETS_NODE": "20.10",
        "getApiSideBabelConfigPath": [Function],
        "getApiSideBabelPlugins": [Function],
        "getApiSideBabelPresets": [Function],
        "getApiSideDefaultBabelConfig": [Function],
        "getCommonPlugins": [Function],
        "getPathsFromConfig": [Function],
        "getWebSideBabelConfigPath": [Function],
        "getWebSideBabelPlugins": [Function],
        "getWebSideBabelPresets": [Function],
        "getWebSideDefaultBabelConfig": [Function],
        "getWebSideOverrides": [Function],
        "parseTypeScriptConfigFiles": [Function],
        "prebuildApiFile": [Function],
        "prebuildWebFile": [Function],
        "registerApiSideBabelHook": [Function],
        "registerBabel": [Function],
        "registerWebSideBabelHook": [Function],
        "transformWithBabel": [Function],
      }
    `)
  })
})
