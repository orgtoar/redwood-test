/* eslint-env node */

import { cd, fs, $ } from 'zx'

const projectPath = await fs.realpath(process.env.PROJECT_PATH)

cd(projectPath)

describe('create-redwood-app', () => {
  test('--help', async () => {
    const p = await $`yarn create-redwood-app --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "Usage: create-redwood-app <project directory>

      Options:
            --help              Show help                                    [boolean]
            --version           Show version number                          [boolean]
        -y, --yes               Skip prompts and use defaults[boolean] [default: null]
            --overwrite         Create even if target directory isn't empty
                                                            [boolean] [default: false]
            --typescript, --ts  Generate a TypeScript project[boolean] [default: null]
            --git-init, --git   Initialize a git repository  [boolean] [default: null]
        -m, --commit-message    Commit message for the initial commit
                                                              [string] [default: null]
            --telemetry         Enables sending telemetry events for this create
                                command and all Redwood CLI commands
                                https://telemetry.redwoodjs.com
                                                             [boolean] [default: true]

      Examples:
        create-redwood-app my-redwood-app
      [?25l[?25h"
    `)
    expect(p.stderr).toMatchInlineSnapshot(`"[?25l[?25h"`)
  })

  test('--version', async () => {
    const p = await $`yarn create-redwood-app --version`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "6.0.7
      [?25l[?25h"
    `)
    expect(p.stderr).toMatchInlineSnapshot(`"[?25l[?25h"`)
  })

  test('--yes, -y', async () => {
    const p = await $`yarn create-redwood-app ./redwood-app --yes`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "------------------------------------------------------------------
                      🌲⚡️ Welcome to RedwoodJS! ⚡️🌲
      ------------------------------------------------------------------
      [?25l⠋ Checking node and yarn compatibility
      [?25h[?25l✔ Compatibility checks passed
      [?25h✔ Creating your Redwood app in ./redwood-app based on command line argument
      ✔ Using TypeScript based on command line flag
      ✔ Will initialize a git repo based on command line flag
      [?25l⠋ Creating project files
      [?25h[?25l✔ Project files created
      [?25h[?25l⠋ Initializing a git repo
      [?25h[?25l✔ Initialized a git repo with commit message "Initial commit"
      [?25h
      Thanks for trying out Redwood!

       ⚡️ Get up and running fast with this Quick Start guide: https://redwoodjs.com/quick-start

      Fire it up! 🚀

       > cd redwood-app
       > yarn install
       > yarn rw dev

      [?25l✔ Initialized a git repo with commit message "Initial commit"
      [?25h"
    `)
    expect(p.stderr).toMatchInlineSnapshot(`"[?25l[?25h[?25l[?25h[?25l[?25h[?25l[?25h[?25l[?25h[?25l[?25h[?25l[?25h"`)

    await fs.rm('./redwood-app', { recursive: true, force: true })
  })

  it.failing('fails on unknown options', async () => {
    try {
      await $`yarn create-redwood-app --unknown-options`.timeout(2500)
      // Fail the test if the function didn't throw.
      expect(true).toEqual(false)
    } catch (p) {
      expect(p.exitCode).toEqual(1)
    }
  })
})
