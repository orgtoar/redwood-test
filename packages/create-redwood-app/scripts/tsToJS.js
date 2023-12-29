/* eslint-env node */

import { transformFileSync } from '@babel/core'
import { format } from 'prettier'
import { fs, glob, path } from 'zx'

const TS_TEMPLATE_PATH = new URL('../templates/ts', import.meta.url)

// Handle node_modules, .yarn/install-state.gz.
const tsTemplateNodeModulesPath = new URL('./node_modules', TS_TEMPLATE_PATH)

console.log('Removing node `modules` in the TS template')
await fs.rm(tsTemplateNodeModulesPath, { recursive: true, force: true })

const tsTemplateYarnInstallStatePath = new URL(
  './.yarn/install-state.gz',
  TS_TEMPLATE_PATH
)

console.log("Removing yarn's `install-state.gz` in the TS template")
await fs.rm(tsTemplateYarnInstallStatePath)

// Clean and copy the TS template to the JS template.
const JS_TEMPLATE_PATH = new URL('../templates/js', import.meta.url)

console.log('Cleaning the JS template')
await fs.rm(JS_TEMPLATE_PATH, { recursive: true, force: true })

console.log('Copying the TS template to the JS template')
await fs.cp(TS_TEMPLATE_PATH, JS_TEMPLATE_PATH)

// Find files and transform.
const filePaths = glob(['{api,web,scripts}/**/*.{ts,tsx}'], {
  cwd: JS_TEMPLATE_PATH,
  absolute: true,
})

console.group('Transforming files in the JS template')

const { default: prettierConfig } = await import(
  new URL('../templates/ts/prettier.config.js', import.meta.url)
)

for (const filePath of filePaths) {
  console.log('Transforming', filePath)

  const result = transformFileSync(filePath, {
    cwd: TS_TEMPLATE_PATH,
    configFile: false,
    plugins: [
      [
        '@babel/plugin-transform-typescript',
        {
          isTSX: true,
          allExtensions: true,
        },
      ],
    ],
    retainLines: true,
  })

  if (!result) {
    throw new Error(`Error: Couldn't transform ${filePath}`)
  }

  const formattedCode = format(result.code, {
    ...prettierConfig,
    parser: 'babel',
  })

  await fs.writeFile(
    filePath.replace('.tsx', '.jsx').replace('.ts', '.js'),
    formattedCode,
    'utf-8'
  )

  await fs.rm(filePath)
}

console.groupEnd()

console.group('Transforming `tsconfig.json`s to `jsconfig.json`s')

const tsConfigFilePaths = glob(['{api,web,scripts}/**/tsconfig.json'], {
  cwd: JS_TEMPLATE_PATH,
  absolute: true,
})

for (const tsConfigFilePath of tsConfigFilePaths) {
  console.log('Transforming', tsConfigFilePath)

  const jsConfigFilePath = path.join(
    path.dirname(tsConfigFilePath),
    'jsconfig.json'
  )

  await fs.rename(tsConfigFilePath, jsConfigFilePath)

  const jsConfig = await fs.readJSON(jsConfigFilePath)

  // This property has no meaning in JS projects.
  delete jsConfig.compilerOptions.allowJs

  await fs.writeJSON(jsConfigFilePath, jsConfig, { spaces: 2 })
}

console.groupEnd()
