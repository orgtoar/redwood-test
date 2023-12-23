import { cd, fs, $ } from 'zx'

const projectPath = await fs.realpath(process.env.PROJECT_PATH)
cd(projectPath)

// ```
// test('--help', async () => {
//   const p = await $`yarn rw --help`
//
//   expect(p.exitCode).toEqual(0)
//   expect(p.stdout).toMatchInlineSnapshot()
//   expect(p.stderr).toEqual('')
// })
// ```
//
// Or
//
// ```
// it('fails on --help', async () => {
//   try {
//     const p = await $`yarn rw --help`
//   } catch (p) {
//     expect(p.exitCode).toEqual(1)
//     expect(p.stdout).toEqual('')
//     expect(p.stderr).toMatchInlineSnapshot()
//   }
// })
// ```

async function clean() {
  await $`git restore .`
  await $`git clean -fd`
  await $`yarn`
}

function trim(str) {
  return str
    .trim()
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
}

describe('yarn rw', () => {
  test('--version', async () => {
    const p = await $`yarn rw --version`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatch(/\d+.\d+.\d+/)
    expect(p.stderr).toEqual('')
  })

  test('--help', async () => {
    const p = await $`yarn rw --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "rw <command>

      Commands:
        rw build [side..]          Build for production
        rw check                   Get structural diagnostics for a Redwood project
                                   (experimental)               [aliases: diagnostics]
        rw console                 Launch an interactive Redwood shell (experimental)
                                                                          [aliases: c]
        rw deploy <target>         Deploy your Redwood project
        rw destroy <type>          Rollback changes made by the generate command
                                                                          [aliases: d]
        rw dev [side..]            Start development servers for api, and web
        rw exec [name]             Run scripts generated with yarn generate script
        rw experimental <command>  Run or setup experimental features   [aliases: exp]
        rw generate <type>         Generate boilerplate code and type definitions
                                                                          [aliases: g]
        rw info                    Print your system environment information
        rw lint [path..]           Lint your files
        rw prerender               Prerender pages of your Redwood app at build time
                                                                     [aliases: render]
        rw prisma [commands..]     Run Prisma CLI with experimental features
        rw record <command>        Set up RedwoodRecord for your project
        rw serve [side]            Run server for api or web in production
        rw setup <command>         Initialize project config and install packages
        rw test [filter..]         Run Jest tests. Defaults to watch mode
        rw ts-to-js                [DEPRECATED]
                                   Convert a TypeScript project to JavaScript
        rw type-check [sides..]    Run a TypeScript compiler check on your project
                                                                    [aliases: tsc, tc]
        rw upgrade                 Upgrade all @redwoodjs packages via interactive CLI
        rw storybook               Launch Storybook: a tool for building UI components
                                   and pages in isolation                [aliases: sb]
        rw data-migrate <command>  Migrate the data in your database
                                                            [aliases: dataMigrate, dm]

      Options:
        --help       Show help                                               [boolean]
        --version    Show version number                                     [boolean]
        --cwd        Working directory to use (where \`redwood.toml\` is located)
        --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]

      Examples:
        yarn rw g page home /  "Create a page component named 'Home' at path '/'"
      "
    `)
    expect(p.stderr).toEqual('')
  })

  it.failing('fails on -v', async () => {
    try {
      await $`yarn rw -v`
      // If the command doesn't throw, fail the test.
      expect(true).toEqual(false)
    } catch (p) {
      expect(p.exitCode).toEqual(1)
      expect(p.stdout).toEqual('')
      expect(
        p.stderr
          .trim()
          .endsWith('Not enough non-option arguments: got 0, need at least 1')
      ).toEqual(true)
    }
  })

  it.failing('fails on -h', async () => {
    try {
      await $`yarn rw -h`
      // If the command doesn't throw, fail the test.
      expect(true).toEqual(false)
    } catch (p) {
      expect(p.exitCode).toEqual(1)
      expect(p.stdout).toEqual('')
      expect(
        p.stderr
          .trim()
          .endsWith('Not enough non-option arguments: got 0, need at least 1')
      ).toEqual(true)
    }
  })

  it.failing('fails on unknown args', async () => {
    try {
      await $`yarn rw abcd`
      // If the command doesn't throw, fail the test.
      expect(true).toEqual(false)
    } catch (p) {
      expect(p.exitCode).toEqual(1)
      expect(p.stdout).toEqual('')
      expect(p.stderr.trim().endsWith('Unknown argument: abcd')).toEqual(true)
    }
  })

  it.failing('demands args', async () => {
    try {
      await $`yarn rw`
      // If the command doesn't throw, fail the test.
      expect(true).toEqual(false)
    } catch (p) {
      expect(p.exitCode).toEqual(1)
      expect(p.stdout).toEqual('')
      expect(
        p.stderr
          .trim()
          .endsWith('Not enough non-option arguments: got 0, need at least 1')
      ).toEqual(true)
    }
  })
})

describe('global options', () => {
  test.failing('--version', async () => {
    try {
      await $`yarn rw info --version`
      expect(true).toEqual(false)
    } catch (p) {
      expect(p.exitCode).toEqual(1)
      expect(p.stdout).toEqual('')
      expect(
        p.stderr
          .trim()
          .endsWith('Not enough non-option arguments: got 0, need at least 1')
      ).toEqual(true)
    }
  })

  test('--cwd', async () => {
    const p = await $`yarn rw info --cwd .`

    expect(p.exitCode).toEqual(0)
    expect(
      p.stdout
        .trim()
        .endsWith('Not enough non-option arguments: got 0, need at least 1')
    ).toEqual(false)
    expect(p.stderr).toEqual('')
  })

  test('--telemetry', async () => {
    const p = await $`yarn rw info --telemetry`

    expect(p.exitCode).toEqual(0)
    expect(
      p.stdout
        .trim()
        .endsWith('Not enough non-option arguments: got 0, need at least 1')
    ).toEqual(false)
    expect(p.stderr).toEqual('')
  })
})

describe('global config', () => {
  test('`demmandCommand` applies to subcommands', async () => {
    try {
      await $`yarn rw deploy`
    } catch (p) {
      expect(p.exitCode).toEqual(1)
      expect(
        p.stdout
          .trim()
          .endsWith('Not enough non-option arguments: got 0, need at least 1')
      ).toEqual(false)
      expect(p.stderr).toEqual('')
    }
  })
})

describe('yarn rw check', () => {
  test('--help', async () => {
    const p = await $`yarn rw check --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "rw check

      Get structural diagnostics for a Redwood project (experimental)

      Options:
        --help       Show help                                               [boolean]
        --version    Show version number                                     [boolean]
        --cwd        Working directory to use (where \`redwood.toml\` is located)
        --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]
      "
    `)
    expect(p.stderr).toEqual('')
  })

  it('works', async () => {
    const p = await $`yarn rw check`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "
      Success: no errors or warnings were detected

      "
    `)
    expect(p.stderr).toEqual('')
  })
})

describe('yarn rw info', () => {
  test('--help', async () => {
    const p = await $`yarn rw info --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "rw info

      Print your system environment information

      Options:
        --help       Show help                                               [boolean]
        --version    Show version number                                     [boolean]
        --cwd        Working directory to use (where \`redwood.toml\` is located)
        --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]

      Also see the Redwood CLI Reference
      (​https://redwoodjs.com/docs/cli-commands#info​)
      "
    `)
    expect(p.stderr).toEqual('')
  })

  it('works', async () => {
    const p = await $`yarn rw info`

    expect(p.exitCode).toEqual(0)

    for (const section of [
      'System',
      'OS',
      'Shell',
      'Binaries',
      'Node',
      'Yarn',
      'Databases',
      'SQLite',
      'Browsers',
      'Chrome',
      'Safari',
      'npmPackages',
      '@redwoodjs/core',
    ]) {
      expect(p.stdout.includes(section)).toEqual(true)
    }

    expect(p.stderr).toEqual('')
  })
})

describe('yarn rw deploy', () => {
  test('--help', async () => {
    const p = await $`yarn rw deploy --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
        "rw deploy <target>

        Deploy your Redwood project

        Commands:
          rw deploy baremetal [environment]  Deploy to baremetal server(s)
          rw deploy flightcontrol <side>     Build, Migrate, and Serve commands for
                                             Flightcontrol deploy
          rw deploy netlify [...commands]    Build command for Netlify deploy
          rw deploy render <side>            Build, Migrate, and Serve command for
                                             Render deploy
          rw deploy vercel [...commands]     Build command for Vercel deploy

        Options:
          --help       Show help                                               [boolean]
          --version    Show version number                                     [boolean]
          --cwd        Working directory to use (where \`redwood.toml\` is located)
          --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]

        Also see the Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#deploy​)
        "
      `)
    expect(p.stderr).toEqual('')
  })

  describe('baremetal', () => {
    test('--help', async () => {
      const p = await $`yarn rw deploy baremetal --help`

      expect(p.exitCode).toEqual(0)
      // One of the options (`--releaseDir`) uses `Date.now()`, so we have to filter that line out.
      expect(
        p.stdout
          .split('\n')
          .filter((line) => !/\d{14}/.test(line))
          .join('\n')
      ).toMatchInlineSnapshot(`
        "rw deploy baremetal [environment]

        Deploy to baremetal server(s)

        Positionals:
          environment  The environment to deploy to                             [string]

        Options:
          --help         Show help                                             [boolean]
          --version      Show version number                                   [boolean]
          --cwd          Working directory to use (where \`redwood.toml\` is located)
          --telemetry    Whether to send anonymous usage telemetry to RedwoodJS[boolean]
          --first-run    Set this flag the first time you deploy: starts server
                         processes from scratch               [boolean] [default: false]
          --update       Update code to latest revision        [boolean] [default: true]
          --install      Run \`yarn install\`                    [boolean] [default: true]
          --migrate      Run database migration tasks          [boolean] [default: true]
          --build        Run build process for the deployed \`sides\`
                                                               [boolean] [default: true]
          --restart      Restart server processes              [boolean] [default: true]
          --cleanup      Remove old deploy directories         [boolean] [default: true]
          --releaseDir   Directory to create for the latest release, defaults to
          --branch       The branch to deploy                                   [string]
          --maintenance  Add/remove the maintenance page         [choices: "up", "down"]
          --rollback     Add/remove the maintenance page
          --verbose      Verbose mode, for debugging purposes [boolean] [default: false]

        Also see the Redwood Baremetal Deploy Reference
        (​https://redwoodjs.com/docs/cli-commands#deploy​)
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it('handles `yarn rw setup deploy baremetal` not being run', async () => {
      try {
        await $`yarn rw deploy baremetal`
      } catch (p) {
        expect(p.exitCode).toEqual(1)
        expect(p.stdout).toEqual('')
        expect(p.stderr).toMatchInlineSnapshot(`
              "Error: Can't find module \`node-ssh\`. Have you set up baremetal deploy?

                yarn rw setup deploy baremetal

              "
          `)
      }
    })
  })

  describe('flightcontrol', () => {
    test('--help', async () => {
      const p = await $`yarn rw deploy flightcontrol --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw deploy flightcontrol <side>

        Build, Migrate, and Serve commands for Flightcontrol deploy

        Positionals:
          side  select side to build         [string] [required] [choices: "api", "web"]

        Options:
          --help                Show help                                      [boolean]
          --version             Show version number                            [boolean]
          --cwd                 Working directory to use (where \`redwood.toml\` is
                                located)
          --telemetry           Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          --prisma              Apply database migrations      [boolean] [default: true]
          --serve               Run server for api in production
                                                              [boolean] [default: false]
          --data-migrate, --dm  Migrate the data in your database
                                                               [boolean] [default: true]

        For more commands, options, and examples, see Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#deploy​)
        "
      `)
      expect(p.stderr).toEqual('')
    })
  })

  describe('netlify', () => {
    test('--help', async () => {
      const p = await $`yarn rw deploy netlify --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw deploy netlify [...commands]

        Build command for Netlify deploy

        Options:
          --help                Show help                                      [boolean]
          --version             Show version number                            [boolean]
          --cwd                 Working directory to use (where \`redwood.toml\` is
                                located)
          --telemetry           Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          --build               Build for production         [boolean] [default: "true"]
          --prisma              Apply database migrations    [boolean] [default: "true"]
          --data-migrate, --dm  Migrate the data in your database
                                                             [boolean] [default: "true"]

        For more commands, options, and examples, see Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#deploy​)
        "
      `)
      expect(p.stderr).toEqual('')
    })
  })

  describe('render', () => {
    test('--help', async () => {
      const p = await $`yarn rw deploy render --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw deploy render <side>

        Build, Migrate, and Serve command for Render deploy

        Positionals:
          side  select side to build         [string] [required] [choices: "api", "web"]

        Options:
          --help                Show help                                      [boolean]
          --version             Show version number                            [boolean]
          --cwd                 Working directory to use (where \`redwood.toml\` is
                                located)
          --telemetry           Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          --prisma              Apply database migrations    [boolean] [default: "true"]
          --data-migrate, --dm  Migrate the data in your database
                                                             [boolean] [default: "true"]

        For more commands, options, and examples, see Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#deploy​)
        "
      `)
      expect(p.stderr).toEqual('')
    })
  })

  describe('vercel', () => {
    test('--help', async () => {
      const p = await $`yarn rw deploy vercel --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw deploy vercel [...commands]

        Build command for Vercel deploy

        Options:
          --help                Show help                                      [boolean]
          --version             Show version number                            [boolean]
          --cwd                 Working directory to use (where \`redwood.toml\` is
                                located)
          --telemetry           Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          --build               Build for production         [boolean] [default: "true"]
          --prisma              Apply database migrations    [boolean] [default: "true"]
          --data-migrate, --dm  Migrate the data in your database
                                                             [boolean] [default: "true"]

        For more commands, options, and examples, see Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#deploy​)
        "
      `)
      expect(p.stderr).toEqual('')
    })
  })
})

describe('yarn rw destroy', () => {
  test('--help', async () => {
    const p = await $`yarn rw destroy --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "rw destroy <type>

      Rollback changes made by the generate command

      Commands:
        rw destroy cell <name>         Destroy a cell component
        rw destroy component <name>    Destroy a component
        rw destroy directive <name>    Destroy a directive
        rw destroy function <name>     Destroy a Function
        rw destroy graphiql            Destroy graphiql header
        rw destroy layout <name>       Destroy a layout component
        rw destroy page <name> [path]  Destroy a page and route component
        rw destroy scaffold <model>    Destroy pages, SDL, and Services files based on
                                       a given DB schema Model
        rw destroy sdl <model>         Destroy a GraphQL schema and service component
                                       based on a given DB schema Model
        rw destroy service <name>      Destroy a service component

      Options:
        --help       Show help                                               [boolean]
        --version    Show version number                                     [boolean]
        --cwd        Working directory to use (where \`redwood.toml\` is located)
        --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]

      Also see the Redwood CLI Reference
      (​https://redwoodjs.com/docs/cli-commands#destroy-alias-d​)
      "
    `)
    expect(p.stderr).toEqual('')
  })
})

describe('yarn rw generate', () => {
  test('--help', async () => {
    const p = await $`yarn rw generate --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "rw generate <type>

      Generate boilerplate code and type definitions

      Commands:
        rw generate cell <name>            Generate a cell component
        rw generate data-migration <name>  Generate a data migration
                                                          [aliases: dataMigration, dm]
        rw generate dbAuth                 Generate Login, Signup and Forgot Password
                                           pages for dbAuth
        rw generate function <name>        Generate a Function
        rw generate model <name>           Generate a RedwoodRecord model
        rw generate realtime <name>        Generate a subscription or live query used
                                           with RedwoodJS Realtime
        rw generate scaffold <model>       Generate Pages, SDL, and Services files
                                           based on a given DB schema Model. Also
                                           accepts <path/model>
        rw generate script <name>          Generate a command line script
        rw generate sdl <model>            Generate a GraphQL schema and service
                                           component based on a given DB schema Model
        rw generate secret                 Generates a secret key using a
                                           cryptographically-secure source of entropy
        rw generate types                  Generate supplementary code

      Options:
        --help       Show help                                               [boolean]
        --version    Show version number                                     [boolean]
        --cwd        Working directory to use (where \`redwood.toml\` is located)
        --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]

      Also see the Redwood CLI Reference
      (​https://redwoodjs.com/docs/cli-commands#generate-alias-g​)
      "
    `)
    expect(p.stderr).toEqual('')
  })

  describe('yarn rw generate cell', () => {
    it('--help', async () => {
      const p = await $`yarn rw generate cell --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw generate cell <name>

        Generate a cell component

        Positionals:
          name  Name of the cell                                     [string] [required]

        Options:
              --help              Show help                                    [boolean]
              --version           Show version number                          [boolean]
              --cwd               Working directory to use (where \`redwood.toml\` is
                                  located)
              --telemetry         Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
              --tests             Generate test files                          [boolean]
              --stories           Generate storybook files                     [boolean]
              --verbose           Print all logs              [boolean] [default: false]
              --rollback          Revert all generator actions if an error occurs
                                                               [boolean] [default: true]
          -f, --force             Overwrite existing files    [boolean] [default: false]
              --typescript, --ts  Generate TypeScript files    [boolean] [default: true]
          -l, --list              Use when you want to generate a cell for a list of the
                                  model name.                 [boolean] [default: false]
              --query             Use to enforce a specific query name within the
                                  generated cell - must be unique.[string] [default: ""]

        Also see the Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#generate-cell​)
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it(
      'works',
      async () => {
        const p = await $`yarn rw generate cell userExamples`

        expect(p.exitCode).toEqual(0)
        expect(p.stdout).toMatchInlineSnapshot(`
                  "[33m❯[39m Generating cell files...
                  [33m❯[39m ...waiting to write file \`./web/src/components/UserExamplesCell/UserExamplesCell.mock.ts\`...
                  [32m✔[39m Successfully wrote file \`./web/src/components/UserExamplesCell/UserExamplesCell.mock.ts\`
                  [33m❯[39m ...waiting to write file \`./web/src/components/UserExamplesCell/UserExamplesCell.test.tsx\`...
                  [32m✔[39m Successfully wrote file \`./web/src/components/UserExamplesCell/UserExamplesCell.test.tsx\`
                  [33m❯[39m ...waiting to write file \`./web/src/components/UserExamplesCell/UserExamplesCell.stories.tsx\`...
                  [32m✔[39m Successfully wrote file \`./web/src/components/UserExamplesCell/UserExamplesCell.stories.tsx\`
                  [33m❯[39m ...waiting to write file \`./web/src/components/UserExamplesCell/UserExamplesCell.tsx\`...
                  [32m✔[39m Successfully wrote file \`./web/src/components/UserExamplesCell/UserExamplesCell.tsx\`
                  [32m✔[39m Generating cell files...
                  [33m❯[39m Generating types ...
                  [33m↓[39m Generating types ... [33m[SKIPPED: Skipping type generation: no SDL defined for "userExamples". To generate types, run 'yarn rw g sdl userExamples'.][39m
                  [?25h"
              `)
        expect(p.stderr).toEqual('')

        await clean()
      },
      5_000 * 2
    )
  })

  describe('yarn rw generate component', () => {
    test('--help', async () => {
      const p = await $`yarn rw generate component --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw generate component <name>

        Generate a component

        Positionals:
          name  Name of the component                                [string] [required]

        Options:
              --help              Show help                                    [boolean]
              --version           Show version number                          [boolean]
              --cwd               Working directory to use (where \`redwood.toml\` is
                                  located)
              --telemetry         Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
              --tests             Generate test files                          [boolean]
              --stories           Generate storybook files                     [boolean]
              --verbose           Print all logs              [boolean] [default: false]
              --rollback          Revert all generator actions if an error occurs
                                                               [boolean] [default: true]
          -f, --force             Overwrite existing files    [boolean] [default: false]
              --typescript, --ts  Generate TypeScript files    [boolean] [default: true]

        Also see the Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#generate-component​)
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it(
      'works',
      async () => {
        const p = await $`yarn rw generate component button`

        expect(p.exitCode).toEqual(0)
        expect(p.stdout).toMatchInlineSnapshot(`
          "[33m❯[39m Generating component files...
          [33m❯[39m ...waiting to write file \`./web/src/components/Button/Button.test.tsx\`...
          [32m✔[39m Successfully wrote file \`./web/src/components/Button/Button.test.tsx\`
          [33m❯[39m ...waiting to write file \`./web/src/components/Button/Button.stories.tsx\`...
          [32m✔[39m Successfully wrote file \`./web/src/components/Button/Button.stories.tsx\`
          [33m❯[39m ...waiting to write file \`./web/src/components/Button/Button.tsx\`...
          [32m✔[39m Successfully wrote file \`./web/src/components/Button/Button.tsx\`
          [32m✔[39m Generating component files...
          [?25h"
        `)
        expect(p.stderr).toEqual('')

        await clean()
      },
      5_000 * 2
    )
  })

  describe('yarn rw generate directive', () => {
    test('--help', async () => {
      const p = await $`yarn rw generate directive --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw generate directive <name>

        Generate a directive component

        Positionals:
          name  Name of the directive                                [string] [required]

        Options:
              --help              Show help                                    [boolean]
              --version           Show version number                          [boolean]
              --cwd               Working directory to use (where \`redwood.toml\` is
                                  located)
              --telemetry         Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
              --tests             Generate test files                          [boolean]
              --stories           Generate storybook files                     [boolean]
              --verbose           Print all logs              [boolean] [default: false]
              --rollback          Revert all generator actions if an error occurs
                                                               [boolean] [default: true]
          -f, --force             Overwrite existing files    [boolean] [default: false]
              --typescript, --ts  Generate TypeScript files    [boolean] [default: true]
              --type              Whether to generate a validator or transformer
                                  directive
                                          [string] [choices: "validator", "transformer"]

        Also see the Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#generate-directive​)
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it(
      'works',
      async () => {
        const p =
          await $`yarn rw generate directive uppercase --type transformer`

        expect(p.exitCode).toEqual(0)
        expect(p.stdout).toMatchInlineSnapshot(`
          "[33m❯[39m Generating directive file ...
          [33m❯[39m ...waiting to write file \`./api/src/directives/uppercase/uppercase.test.ts\`...
          [32m✔[39m Successfully wrote file \`./api/src/directives/uppercase/uppercase.test.ts\`
          [33m❯[39m ...waiting to write file \`./api/src/directives/uppercase/uppercase.ts\`...
          [32m✔[39m Successfully wrote file \`./api/src/directives/uppercase/uppercase.ts\`
          [32m✔[39m Generating directive file ...
          [33m❯[39m Generating TypeScript definitions and GraphQL schemas ...
          Generating...

          - .redwood/schema.graphql
          - .redwood/types/mirror/api/src/directives/requireAuth/index.d.ts
          - .redwood/types/mirror/api/src/directives/skipAuth/index.d.ts
          - .redwood/types/mirror/api/src/directives/uppercase/index.d.ts
          - .redwood/types/mirror/web/src/pages/FatalErrorPage/index.d.ts
          - .redwood/types/mirror/web/src/pages/NotFoundPage/index.d.ts
          - .redwood/types/includes/web-routesPages.d.ts
          - .redwood/types/includes/all-currentUser.d.ts
          - .redwood/types/includes/web-routerRoutes.d.ts
          - .redwood/types/includes/api-globImports.d.ts
          - .redwood/types/includes/api-globalContext.d.ts
          - .redwood/types/includes/api-scenarios.d.ts
          - .redwood/types/includes/api-test-globals.d.ts
          - .redwood/types/includes/web-test-globals.d.ts
          - .redwood/types/includes/web-storybook.d.ts
          - api/types/graphql.d.ts

          ... done.

          [32m✔[39m Generating TypeScript definitions and GraphQL schemas ...
          [33m❯[39m Next steps...
          [32m✔[39m Next steps...

          [32m✔[39m    After modifying your directive, you can add it to your SDLs e.g.:
          [32m✔[39m     // example todo.sdl.js
          [32m✔[39m     # Option A: Add it to a field
          [32m✔[39m     type Todo {
          [32m✔[39m       id: Int!
          [32m✔[39m       body: String! @uppercase
          [32m✔[39m     }

          [32m✔[39m     # Option B: Add it to query/mutation
          [32m✔[39m     type Query {
          [32m✔[39m       todos: [Todo] @uppercase
          [32m✔[39m     }

          [?25h"
        `)
        expect(p.stderr).toEqual('')

        await clean()
      },
      5_000 * 2
    )
  })

  describe('yarn rw generate layout', () => {
    test('--help', async () => {
      const p = await $`yarn rw generate layout --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw generate layout <name>

        Generate a layout component

        Positionals:
          name  Name of the layout                                   [string] [required]

        Options:
              --help              Show help                                    [boolean]
              --version           Show version number                          [boolean]
              --cwd               Working directory to use (where \`redwood.toml\` is
                                  located)
              --telemetry         Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
              --tests             Generate test files                          [boolean]
              --stories           Generate storybook files                     [boolean]
              --verbose           Print all logs              [boolean] [default: false]
              --rollback          Revert all generator actions if an error occurs
                                                               [boolean] [default: true]
              --skipLink          Generate with skip link     [boolean] [default: false]
          -f, --force             Overwrite existing files    [boolean] [default: false]
              --typescript, --ts  Generate TypeScript files    [boolean] [default: true]

        Also see the Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#generate-layout​)
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it(
      'works',
      async () => {
        const p = await $`yarn rw generate layout main`

        expect(p.exitCode).toEqual(0)
        expect(p.stdout).toMatchInlineSnapshot(`
          "[33m❯[39m Generating layout files...
          [33m❯[39m ...waiting to write file \`./web/src/layouts/MainLayout/MainLayout.test.tsx\`...
          [32m✔[39m Successfully wrote file \`./web/src/layouts/MainLayout/MainLayout.test.tsx\`
          [33m❯[39m ...waiting to write file \`./web/src/layouts/MainLayout/MainLayout.stories.tsx\`...
          [32m✔[39m Successfully wrote file \`./web/src/layouts/MainLayout/MainLayout.stories.tsx\`
          [33m❯[39m ...waiting to write file \`./web/src/layouts/MainLayout/MainLayout.tsx\`...
          [32m✔[39m Successfully wrote file \`./web/src/layouts/MainLayout/MainLayout.tsx\`
          [32m✔[39m Generating layout files...
          [?25h"
        `)
        expect(p.stderr).toEqual('')

        await clean()
      },
      5_000 * 2
    )
  })

  describe('yarn rw generate page', () => {
    test('--help', async () => {
      const p = await $`yarn rw generate page --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw generate page <name> [path]

        Generate a page component

        Positionals:
          name  Name of the page                                     [string] [required]
          path  URL path to the page, or just {param}. Defaults to name         [string]

        Options:
              --help              Show help                                    [boolean]
              --version           Show version number                          [boolean]
              --cwd               Working directory to use (where \`redwood.toml\` is
                                  located)
              --telemetry         Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
              --tests             Generate test files                          [boolean]
              --stories           Generate storybook files                     [boolean]
              --verbose           Print all logs              [boolean] [default: false]
              --rollback          Revert all generator actions if an error occurs
                                                               [boolean] [default: true]
          -f, --force             Overwrite existing files    [boolean] [default: false]
              --typescript, --ts  Generate TypeScript files    [boolean] [default: true]

        Also see the Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#generate-page​)
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it(
      'works',
      async () => {
        const p = await $`yarn rw generate page home /`

        expect(p.exitCode).toEqual(0)
        expect(p.stdout).toMatchInlineSnapshot(`
          "[33m❯[39m Generating page files...
          [33m❯[39m ...waiting to write file \`./web/src/pages/HomePage/HomePage.stories.tsx\`...
          [32m✔[39m Successfully wrote file \`./web/src/pages/HomePage/HomePage.stories.tsx\`
          [33m❯[39m ...waiting to write file \`./web/src/pages/HomePage/HomePage.test.tsx\`...
          [32m✔[39m Successfully wrote file \`./web/src/pages/HomePage/HomePage.test.tsx\`
          [33m❯[39m ...waiting to write file \`./web/src/pages/HomePage/HomePage.tsx\`...
          [32m✔[39m Successfully wrote file \`./web/src/pages/HomePage/HomePage.tsx\`
          [32m✔[39m Generating page files...
          [33m❯[39m Updating routes file...
          [32m✔[39m Updating routes file...
          [33m❯[39m Generating types...
          [32m✔[39m Generating types...
          [33m❯[39m One more thing...
          [32m✔[39m One more thing...

          [32m✔[39m    Page created! A note about <Metadata>:

          [32m✔[39m    At the top of your newly created page is a <Metadata> component,
          [32m✔[39m    which contains the title and description for your page, essential
          [32m✔[39m    to good SEO. Check out this page for best practices:

          [32m✔[39m    https://developers.google.com/search/docs/advanced/appearance/good-titles-snippets

          [?25h"
        `)
        expect(p.stderr).toEqual('')

        await clean()
      },
      5_000 * 2
    )
  })

  describe('yarn rw generate secret', () => {
    it('--help', async () => {
      const p = await $`yarn rw g secret --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw g secret

        Generates a secret key using a cryptographically-secure source of entropy

        Options:
          --help       Show help                                               [boolean]
          --version    Show version number                                     [boolean]
          --cwd        Working directory to use (where \`redwood.toml\` is located)
          --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]
          --length     Length of the generated secret                      [default: 32]
          --raw        Prints just the raw secret             [boolean] [default: false]

        Also see the Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#generate-secret​)
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it('works', async () => {
      const p = await $`yarn rw g secret --raw`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatch(/.{43}/)
      expect(p.stderr).toEqual('')
    })
  })

  describe('yarn rw generate service', () => {
    test('--help', async () => {
      const p = await $`yarn rw generate service --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw generate service <name>

        Generate a service component

        Positionals:
          name  Name of the service                                  [string] [required]

        Options:
              --help              Show help                                    [boolean]
              --version           Show version number                          [boolean]
              --cwd               Working directory to use (where \`redwood.toml\` is
                                  located)
              --telemetry         Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
              --rollback          Revert all generator actions if an error occurs
                                                               [boolean] [default: true]
          -f, --force             Overwrite existing files    [boolean] [default: false]
              --typescript, --ts  Generate TypeScript files    [boolean] [default: true]
              --tests             Generate test files                          [boolean]
              --crud              Create CRUD functions        [boolean] [default: true]

        Also see the Redwood CLI Reference
        (​https://redwoodjs.com/docs/cli-commands#generate-service​)
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it(
      'works',
      async () => {
        const p = await $`yarn rw generate service userExamples`

        expect(p.exitCode).toEqual(0)
        expect(p.stdout).toMatchInlineSnapshot(`
          "[33m❯[39m Generating service files...
          [33m❯[39m ...waiting to write file \`./api/src/services/userExamples/userExamples.scenarios.ts\`...
          [32m✔[39m Successfully wrote file \`./api/src/services/userExamples/userExamples.scenarios.ts\`
          [33m❯[39m ...waiting to write file \`./api/src/services/userExamples/userExamples.test.ts\`...
          [32m✔[39m Successfully wrote file \`./api/src/services/userExamples/userExamples.test.ts\`
          [33m❯[39m ...waiting to write file \`./api/src/services/userExamples/userExamples.ts\`...
          [32m✔[39m Successfully wrote file \`./api/src/services/userExamples/userExamples.ts\`
          [32m✔[39m Generating service files...
          [?25h"
        `)
        expect(p.stderr).toEqual('')

        await clean()
      },
      5_000 * 2
    )
  })
})

describe('yarn rw experimental', () => {
  test('--help', async () => {
    const p = await $`yarn rw experimental --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "rw experimental <command>

      Run or setup experimental features

      Commands:
        rw experimental setup-docker         Setup the experimental Dockerfile
        rw experimental setup-inngest        Setup Inngest for background, scheduled,
                                             delayed, multi-step, and fan-out jobs
        rw experimental setup-opentelemetry  Setup OpenTelemetry within the API side
        rw experimental setup-rsc            Enable React Server Components (RSC)
        rw experimental setup-sentry         Setup Sentry error and performance
                                             tracking
        rw experimental setup-server-file    Setup the experimental server file
        rw experimental setup-streaming-ssr  Enable React Streaming and Server Side
                                             Rendering (SSR)
        rw experimental studio               Run the Redwood development studio

      Options:
        --help       Show help                                               [boolean]
        --version    Show version number                                     [boolean]
        --cwd        Working directory to use (where \`redwood.toml\` is located)
        --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]

      Also see the Redwood CLI Reference
      (​https://redwoodjs.com/docs/cli-commands#experimental​)
      "
    `)
    expect(p.stderr).toEqual('')
  })
})

describe('yarn rw prisma', () => {
  test('--help', async () => {
    const p = await $`yarn rw prisma --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "
      Running Prisma CLI...
      $ yarn prisma --help


      ◭  Prisma is a modern DB toolkit to query, migrate and model your database (https://prisma.io)

      Usage

        $ prisma [command]

      Commands

                  init   Set up Prisma for your app
              generate   Generate artifacts (e.g. Prisma Client)
                    db   Manage your database schema and lifecycle
               migrate   Migrate your database
                studio   Browse your data with Prisma Studio
              validate   Validate your Prisma schema
                format   Format your Prisma schema
               version   Displays Prisma version info
                 debug   Displays Prisma debug info

      Flags

           --preview-feature   Run Preview Prisma commands
           --help, -h          Show additional information about a command

      Examples

        Set up a new Prisma project
        $ prisma init

        Generate artifacts (e.g. Prisma Client)
        $ prisma generate

        Browse your data
        $ prisma studio

        Create migrations from your Prisma schema, apply them to the database, generate artifacts (e.g. Prisma Client)
        $ prisma migrate dev

        Pull the schema from an existing database, updating the Prisma schema
        $ prisma db pull

        Push the Prisma schema state to the database
        $ prisma db push

        Validate your Prisma schema
        $ prisma validate

        Format your Prisma schema
        $ prisma format

        Display Prisma version info
        $ prisma version

        Display Prisma debug info
        $ prisma debug


      ┌──────────────────────────────────────────────────────────────────────────────┐│ Redwood CLI wraps Prisma CLI                                                 ││                                                                              ││ Use \`yarn rw prisma\` to automatically pass \`--schema\` and                    ││ \`--preview-feature\` options.                                                 ││ Use \`yarn prisma\` to skip Redwood CLI automatic options.                     ││                                                                              ││ Find more information in our docs:                                           ││ https://redwoodjs.com/docs/cli-commands#prisma                               │└──────────────────────────────────────────────────────────────────────────────┘

      "
    `)
    expect(p.stderr).toEqual('')
  })
})

describe('yarn rw record', () => {
  test('--help', async () => {
    const p = await $`yarn rw record --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "rw record <command>

      Set up RedwoodRecord for your project

      Commands:
        rw record init  Caches a JSON version of your data model and adds
                        \`api/src/models/index.js\` with some config

      Options:
        --help       Show help                                               [boolean]
        --version    Show version number                                     [boolean]
        --cwd        Working directory to use (where \`redwood.toml\` is located)
        --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]

      Also see the RedwoodRecord Docs (​https://redwoodjs.com/docs/redwoodrecord​)
      "
    `)
    expect(p.stderr).toEqual('')
  })

  describe('init', () => {
    test('--help', async () => {
      const p = await $`yarn rw record init --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw record init

        Caches a JSON version of your data model and adds \`api/src/models/index.js\` with
        some config

        Options:
          --help       Show help                                               [boolean]
          --version    Show version number                                     [boolean]
          --cwd        Working directory to use (where \`redwood.toml\` is located)
          --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it('handles `@redwoodjs/record` being missing', async () => {
      try {
        await $`yarn rw record init`
      } catch (p) {
        expect(p.exitCode).toEqual(1)
        expect(p.stdout).toEqual('')
        expect(p.stderr).toMatchInlineSnapshot(`
                  "Error: Can't find module \`@redwoojds/record\`. Have you added \`@redwoodjs/record\` to the api side?

                    yarn workspace api add @redwoodjs/record

                  "
              `)
      }
    })

    it(
      'works',
      async () => {
        await $`yarn ./api add @redwoodjs/record`
        const p = await $`yarn rw record init`

        expect(p.exitCode).toEqual(0)
        expect(p.stderr).toEqual('')

        const matches = Array.from(p.stdout.matchAll(/Wrote (\S+)/g))
        expect(matches.length).toEqual(2)

        const [datamodelPath, indexPath] = matches.map(
          ([_line, captureGroup]) => captureGroup
        )

        const datamodel = await fs.readFile(datamodelPath, {
          encoding: 'utf-8',
        })
        expect(datamodel).toMatchInlineSnapshot(`
          "module.exports = {
            enums: [],
            models: [
              {
                name: "UserExample",
                dbName: null,
                fields: [
                  {
                    name: "id",
                    kind: "scalar",
                    isList: false,
                    isRequired: true,
                    isUnique: false,
                    isId: true,
                    isReadOnly: false,
                    hasDefaultValue: true,
                    type: "Int",
                    default: {
                      name: "autoincrement",
                      args: []
                    },
                    isGenerated: false,
                    isUpdatedAt: false
                  },
                  {
                    name: "email",
                    kind: "scalar",
                    isList: false,
                    isRequired: true,
                    isUnique: true,
                    isId: false,
                    isReadOnly: false,
                    hasDefaultValue: false,
                    type: "String",
                    isGenerated: false,
                    isUpdatedAt: false
                  },
                  {
                    name: "name",
                    kind: "scalar",
                    isList: false,
                    isRequired: false,
                    isUnique: false,
                    isId: false,
                    isReadOnly: false,
                    hasDefaultValue: false,
                    type: "String",
                    isGenerated: false,
                    isUpdatedAt: false
                  }
                ],
                primaryKey: null,
                uniqueFields: [],
                uniqueIndexes: [],
                isGenerated: false
              }
            ],
            types: []
          };
          "
        `)

        const index = await fs.readFile(indexPath, { encoding: 'utf-8' })
        expect(index).toMatchInlineSnapshot(`
          "// This file is autogenerated by Redwood and will be overwritten periodically.

          import { RedwoodRecord } from '@redwoodjs/record'

          import { db } from 'src/lib/db'
          import datamodel from 'src/models/datamodel'

          RedwoodRecord.db = db
          RedwoodRecord.schema = datamodel
          "
        `)

        await clean()
      },
      5_000 * 2
    )
  })
})

describe('yarn rw setup', () => {
  test('--help', async () => {
    const p = await $`yarn rw setup --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "rw setup <command>

      Initialize project config and install packages

      Commands:
        rw setup auth <provider>        Set up an auth configuration
        rw setup cache <client>         Sets up an init file for service caching
        rw setup custom-web-index       Set up a custom index.js file, so you can
                                        customise how Redwood web is mounted in your
                                        browser (webpack only)
        rw setup deploy <target>        Setup deployment to various targets
        rw setup generator <name>       Copies generator templates locally for
                                        customization
        rw setup graphiql <provider>    Generate GraphiQL headers
        rw setup i18n                   Set up i18n
        rw setup mailer                 Setup the redwood mailer. This will install
                                        the required packages and add the required
                                        initial configuration to your redwood app.
        rw setup package <npm-package>  Run a bin from an NPM package with version
                                        compatibility checks
        rw setup realtime               Setup RedwoodJS Realtime
        rw setup tsconfig               Set up tsconfig for web and api sides
        rw setup ui <library>           Set up a UI design or style library
        rw setup vite                   Configure the web side to use Vite, instead of
                                        Webpack
        rw setup webpack                Set up webpack in your project so you can add
                                        custom config

      Options:
        --help       Show help                                               [boolean]
        --version    Show version number                                     [boolean]
        --cwd        Working directory to use (where \`redwood.toml\` is located)
        --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]

      Also see the Redwood CLI Reference
      (​https://redwoodjs.com/docs/cli-commands#setup​)
      "
    `)
    expect(p.stderr).toEqual('')
  })
})

describe('yarn rw setup deploy', () => {
  test('--help', async () => {
    const p = await $`yarn rw setup deploy --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "rw setup deploy <target>

      Setup deployment to various targets

      Commands:
        rw setup deploy baremetal      Setup Baremetal deploy
        rw setup deploy coherence      Setup Coherence deploy
        rw setup deploy flightcontrol  Setup Flightcontrol deploy
        rw setup deploy netlify        Setup Netlify deploy
        rw setup deploy render         Setup Render deploy
        rw setup deploy vercel         Setup Vercel deploy

      Options:
            --help       Show help                                           [boolean]
            --version    Show version number                                 [boolean]
            --cwd        Working directory to use (where \`redwood.toml\` is located)
            --telemetry  Whether to send anonymous usage telemetry to RedwoodJS
                                                                             [boolean]
        -f, --force      Overwrite existing configuration   [boolean] [default: false]

      Also see the Redwood CLI Reference
      (​https://redwoodjs.com/docs/cli-commands#setup-deploy-config​)
      "
    `)
    expect(p.stderr).toEqual('')
  })

  describe('yarn rw setup deploy baremetal', () => {
    test('--help', async () => {
      const p = await $`yarn rw setup deploy baremetal --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw setup deploy baremetal

        Setup Baremetal deploy

        Options:
              --help       Show help                                           [boolean]
              --version    Show version number                                 [boolean]
              --cwd        Working directory to use (where \`redwood.toml\` is located)
              --telemetry  Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          -f, --force      Overwrite existing configuration   [boolean] [default: false]
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it(
      'works',
      async () => {
        const p = await $`yarn rw setup deploy baremetal`

        expect(p.exitCode).toEqual(0)
        expect(p.stdout).toMatchInlineSnapshot(`
                  "[33m❯[39m Adding dependencies to project
                  [32m✔[39m Adding dependencies to project
                  [33m❯[39m Adding config...
                  [33m❯[39m ...waiting to write file \`./deploy.toml\`...
                  [32m✔[39m Successfully wrote file \`./deploy.toml\`
                  [33m❯[39m ...waiting to write file \`./ecosystem.config.js\`...
                  [32m✔[39m Successfully wrote file \`./ecosystem.config.js\`
                  [33m❯[39m ...waiting to write file \`./web/src/maintenance.html\`...
                  [32m✔[39m Successfully wrote file \`./web/src/maintenance.html\`
                  [32m✔[39m Adding config...
                  [33m❯[39m One more thing...
                  [32m✔[39m One more thing...

                  [32m✔[39m    ┌─────────────────────────────────────────────────────────────────────┐
                  [32m✔[39m    │                                                                     │
                  [32m✔[39m    │ You are almost ready to go BAREMETAL!                               │
                  [32m✔[39m    │                                                                     │
                  [32m✔[39m    │ See https://redwoodjs.com/docs/deploy/baremetal for the remaining   │
                  [32m✔[39m    │ config and setup required before you can perform your first deploy. │
                  [32m✔[39m    │                                                                     │
                  [32m✔[39m    └─────────────────────────────────────────────────────────────────────┘

                  [?25h"
              `)
        expect(p.stderr).toEqual('')

        await clean()
      },
      5_000 * 2
    )
  })

  describe('yarn rw setup deploy coherence', () => {
    test('--help', async () => {
      const p = await $`yarn rw setup deploy coherence --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw setup deploy coherence

        Setup Coherence deploy

        Options:
              --help       Show help                                           [boolean]
              --version    Show version number                                 [boolean]
              --cwd        Working directory to use (where \`redwood.toml\` is located)
              --telemetry  Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          -f, --force      Overwrite existing configuration   [boolean] [default: false]
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it('fails by default', async () => {
      try {
        await $`yarn rw setup deploy coherence`
      } catch (p) {
        expect(p.exitCode).toEqual(1)
        expect(p.stdout).toEqual('')
        expect(p.stderr).toMatchInlineSnapshot(`
          "Coherence doesn't support the "sqlite" provider in your Prisma schema.
          To proceed, switch to one of the following: mysql, postgresql.
          "
        `)
      }
    })
  })

  describe('yarn rw setup deploy flightcontrol', () => {
    test('--help', async () => {
      const p = await $`yarn rw setup deploy flightcontrol --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw setup deploy flightcontrol

        Setup Flightcontrol deploy

        Options:
              --help       Show help                                           [boolean]
              --version    Show version number                                 [boolean]
              --cwd        Working directory to use (where \`redwood.toml\` is located)
              --telemetry  Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          -f, --force      Overwrite existing configuration   [boolean] [default: false]
          -d, --database   Database deployment for Flightcontrol only
               [string] [choices: "none", "postgresql", "mysql"] [default: "postgresql"]
        "
      `)
      expect(p.stderr).toEqual('')
    })

    // A Redwood app's default db datasource provider is `sqlite`,
    // while `yarn rw setup deploy render`'s default database is postgresql.
    it('fails by default', async () => {
      try {
        await $`yarn rw setup deploy flightcontrol`
      } catch (p) {
        expect(p.exitCode).toEqual(1)
        expect(p.stdout).toMatchInlineSnapshot(`
          "[33m❯[39m Adding flightcontrol.json
          [?25h"
        `)
        expect(trim(p.stderr)).toMatchInlineSnapshot(`
          "[31m✖[39m Adding flightcontrol.json [31m[FAILED:
              Prisma datasource provider is detected to be sqlite.

              Update your schema.prisma provider to be postgresql or mysql, then run
              yarn rw prisma migrate dev
              yarn rw setup deploy flightcontrol
              ][39m

              Prisma datasource provider is detected to be sqlite.

              Update your schema.prisma provider to be postgresql or mysql, then run
              yarn rw prisma migrate dev
              yarn rw setup deploy flightcontrol"
        `)
      }
    })

    it('can work', async () => {
      const p = await $`yarn rw setup deploy flightcontrol --database=none`

      expect(p.exitCode).toEqual(0)
      expect(trim(p.stdout)).toMatchInlineSnapshot(`
        "[33m❯[39m Adding flightcontrol.json
        [33m❯[39m ...waiting to write file \`./flightcontrol.json\`...
        [32m✔[39m Successfully wrote file \`./flightcontrol.json\`
        [32m✔[39m Adding flightcontrol.json
        [33m❯[39m Adding CORS config to createGraphQLHandler...
        [32m✔[39m Adding CORS config to createGraphQLHandler...
        [33m❯[39m Updating dbAuth cookie config (if used)...
        Skipping, did not detect api/src/functions/auth.js
        [32m✔[39m Updating dbAuth cookie config (if used)...
        [33m❯[39m Updating App.jsx fetch config...

            Couldn't find <AuthProvider /> in web/src/App.js
            If (and when) you use *dbAuth*, you'll have to add the following fetch config to <AuthProvider />:

            config={{ fetchConfig: { credentials: 'include' } }}

        [32m✔[39m Updating App.jsx fetch config...
        [33m❯[39m Updating API URL in redwood.toml...
        [32m✔[39m Updating API URL in redwood.toml...
        [33m❯[39m Updating .env.defaults...
        [32m✔[39m Updating .env.defaults...
        [33m❯[39m One more thing...
        [32m✔[39m One more thing...

        [32m✔[39m  ┌────────────────────────────────────────────────────────────────────────────┐
        [32m✔[39m  │                                                                            │
        [32m✔[39m  │ You are ready to deploy to Flightcontrol!                                  │
        [32m✔[39m  │                                                                            │
        [32m✔[39m  │ 👉 Create your project at https://app.flightcontrol.dev/signup?ref=redwood │
        [32m✔[39m  │                                                                            │
        [32m✔[39m  │ Check out the deployment docs at https://app.flightcontrol.dev/docs for    │
        [32m✔[39m  │ detailed instructions                                                      │
        [32m✔[39m  │                                                                            │
        [32m✔[39m  │ NOTE: If you are using yarn v1, remove the installCommand's from           │
        [32m✔[39m  │ flightcontrol.json                                                         │
        [32m✔[39m  │                                                                            │
        [32m✔[39m  └────────────────────────────────────────────────────────────────────────────┘

        [?25h"
      `)
      expect(p.stderr).toEqual('')

      await clean()
    })
  })

  describe('yarn rw setup deploy netlify', () => {
    test('--help', async () => {
      const p = await $`yarn rw setup deploy netlify --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw setup deploy netlify

        Setup Netlify deploy

        Options:
              --help       Show help                                           [boolean]
              --version    Show version number                                 [boolean]
              --cwd        Working directory to use (where \`redwood.toml\` is located)
              --telemetry  Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          -f, --force      Overwrite existing configuration   [boolean] [default: false]
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it('works', async () => {
      const p = await $`yarn rw setup deploy netlify`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "[33m❯[39m Updating API URL in redwood.toml...
        [32m✔[39m Updating API URL in redwood.toml...
        [33m❯[39m Adding config...
        [33m❯[39m ...waiting to write file \`./netlify.toml\`...
        [32m✔[39m Successfully wrote file \`./netlify.toml\`
        [32m✔[39m Adding config...
        [33m❯[39m One more thing...
        [32m✔[39m One more thing...

        [32m✔[39m    ┌────────────────────────────────────────────────┐
        [32m✔[39m    │                                                │
        [32m✔[39m    │ You are ready to deploy to Netlify!            │
        [32m✔[39m    │ See: https://redwoodjs.com/docs/deploy/netlify │
        [32m✔[39m    │                                                │
        [32m✔[39m    └────────────────────────────────────────────────┘

        [?25h"
      `)
      expect(p.stderr).toEqual('')

      await clean()
    })
  })

  describe('yarn rw setup deploy render', () => {
    test('--help', async () => {
      const p = await $`yarn rw setup deploy render --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw setup deploy render

        Setup Render deploy

        Options:
              --help       Show help                                           [boolean]
              --version    Show version number                                 [boolean]
              --cwd        Working directory to use (where \`redwood.toml\` is located)
              --telemetry  Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          -f, --force      Overwrite existing configuration   [boolean] [default: false]
          -d, --database   Database deployment for Render only
              [string] [choices: "none", "postgresql", "sqlite"] [default: "postgresql"]
        "
      `)
      expect(p.stderr).toEqual('')
    })

    // A Redwood app's default db datasource provider is `sqlite`,
    // while `yarn rw setup deploy render`'s default database is postgresql.
    it('fails by default', async () => {
      try {
        await $`yarn rw setup deploy render`
      } catch (p) {
        expect(p.exitCode).toEqual(1)
        expect(p.stdout).toMatchInlineSnapshot(`
          "[33m❯[39m Adding render.yaml
          [?25h"
        `)
        expect(trim(p.stderr)).toMatchInlineSnapshot(`
          "[31m✖[39m Adding render.yaml [31m[FAILED:
              Prisma datasource provider is detected to be sqlite.

              Option 1: Update your schema.prisma provider to be postgresql, then run
              yarn rw prisma migrate dev
              yarn rw setup deploy render --database postgresql

              Option 2: Rerun setup deploy command with current schema.prisma provider:
              yarn rw setup deploy render --database sqlite][39m

              Prisma datasource provider is detected to be sqlite.

              Option 1: Update your schema.prisma provider to be postgresql, then run
              yarn rw prisma migrate dev
              yarn rw setup deploy render --database postgresql

              Option 2: Rerun setup deploy command with current schema.prisma provider:
              yarn rw setup deploy render --database sqlite"
        `)
      }
    })

    it('works', async () => {
      const p = await $`yarn rw setup deploy render --database sqlite`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "[33m❯[39m Adding render.yaml
        [33m❯[39m ...waiting to write file \`./render.yaml\`...
        [32m✔[39m Successfully wrote file \`./render.yaml\`
        [32m✔[39m Adding render.yaml
        [33m❯[39m Updating API URL in redwood.toml...
        [32m✔[39m Updating API URL in redwood.toml...
        [33m❯[39m Adding config...
        [33m❯[39m ...waiting to write file \`./api/src/functions/healthz.js\`...
        [32m✔[39m Successfully wrote file \`./api/src/functions/healthz.js\`
        [32m✔[39m Adding config...
        [33m❯[39m One more thing...
        [32m✔[39m One more thing...

        [32m✔[39m ┌──────────────────────────────────────────────────────────────────────────────┐│                                                                              ││ You are ready to deploy to Render!                                           ││                                                                              ││ Go to https://dashboard.render.com/iacs to create your account and deploy to ││ Render                                                                       ││ Check out the deployment docs at https://render.com/docs/deploy-redwood for  ││ detailed instructions                                                        ││ Note: After first deployment to Render update the rewrite rule destination   ││ in \`./render.yaml\`                                                           ││                                                                              │└──────────────────────────────────────────────────────────────────────────────┘

        [?25h"
      `)
      expect(p.stderr).toEqual('')

      await clean()
    })
  })

  describe('yarn rw setup deploy vercel', () => {
    test('--help', async () => {
      const p = await $`yarn rw setup deploy vercel --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw setup deploy vercel

        Setup Vercel deploy

        Options:
              --help       Show help                                           [boolean]
              --version    Show version number                                 [boolean]
              --cwd        Working directory to use (where \`redwood.toml\` is located)
              --telemetry  Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          -f, --force      Overwrite existing configuration   [boolean] [default: false]
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it('works', async () => {
      const p = await $`yarn rw setup deploy vercel`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "[33m❯[39m Updating API URL in redwood.toml...
        [32m✔[39m Updating API URL in redwood.toml...
        [33m❯[39m One more thing...
        [32m✔[39m One more thing...

        [32m✔[39m    ┌──────────────────────────────────────────────────────┐
        [32m✔[39m    │                                                      │
        [32m✔[39m    │ You are ready to deploy to Vercel!                   │
        [32m✔[39m    │ See: https://redwoodjs.com/docs/deploy#vercel-deploy │
        [32m✔[39m    │                                                      │
        [32m✔[39m    └──────────────────────────────────────────────────────┘

        [?25h"
      `)
      expect(p.stderr).toEqual('')

      await clean()
    })
  })
})

describe('yarn rw setup ui', () => {
  test('--help', async () => {
    const p = await $`yarn rw setup ui --help`

    expect(p.exitCode).toEqual(0)
    expect(p.stdout).toMatchInlineSnapshot(`
      "rw setup ui <library>

      Set up a UI design or style library

      Commands:
        rw setup ui chakra-ui    Set up Chakra UI
        rw setup ui mantine      Set up Mantine UI
        rw setup ui tailwindcss  Set up tailwindcss and PostCSS[aliases: tailwind, tw]

      Options:
        --help       Show help                                               [boolean]
        --version    Show version number                                     [boolean]
        --cwd        Working directory to use (where \`redwood.toml\` is located)
        --telemetry  Whether to send anonymous usage telemetry to RedwoodJS  [boolean]

      Also see the Redwood CLI Reference
      (​https://redwoodjs.com/docs/cli-commands#setup-ui​)
      "
    `)
    expect(p.stderr).toEqual('')
  })

  describe('yarn rw setup ui chakra-ui', () => {
    test('--help', async () => {
      const p = await $`yarn rw setup ui chakra-ui --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw setup ui chakra-ui

        Set up Chakra UI

        Options:
              --help       Show help                                           [boolean]
              --version    Show version number                                 [boolean]
              --cwd        Working directory to use (where \`redwood.toml\` is located)
              --telemetry  Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          -f, --force      Overwrite existing configuration   [boolean] [default: false]
          -i, --install    Install packages                    [boolean] [default: true]
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it(
      'works',
      async () => {
        const p = await $`yarn rw setup ui chakra-ui`

        expect(p.exitCode).toEqual(0)
        expect(p.stdout).toMatchInlineSnapshot(`
                  "[33m❯[39m Installing packages...
                  [33m❯[39m Install @chakra-ui/react@^2, @emotion/react@^11, @emotion/styled@^11, framer-motion@^9
                  [32m✔[39m Install @chakra-ui/react@^2, @emotion/react@^11, @emotion/styled@^11, framer-motion@^9
                  [32m✔[39m Installing packages...
                  [33m❯[39m Setting up Chakra UI...
                  [32m✔[39m Setting up Chakra UI...
                  [33m❯[39m Creating Theme File...
                  [32m✔[39m Creating Theme File...
                  [33m❯[39m Configure Storybook...
                  [32m✔[39m Configure Storybook...
                  [?25h"
              `)
        expect(p.stderr).toEqual('')

        await clean()
      },
      5_000 * 2
    )
  })

  describe('yarn rw setup ui mantine', () => {
    test('--help', async () => {
      const p = await $`yarn rw setup ui mantine --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw setup ui mantine

        Set up Mantine UI

        Options:
              --help       Show help                                           [boolean]
              --version    Show version number                                 [boolean]
              --cwd        Working directory to use (where \`redwood.toml\` is located)
              --telemetry  Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          -f, --force      Overwrite existing configuration   [boolean] [default: false]
          -i, --install    Install packages                    [boolean] [default: true]
          -p, --packages   Mantine packages to install. Specify 'all' to install all
                           packages. Default: ['core', 'hooks']
                                                     [array] [default: ["core","hooks"]]
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it(
      'works',
      async () => {
        const p = await $`yarn rw setup ui mantine`

        expect(p.exitCode).toEqual(0)
        expect(p.stdout).toMatchInlineSnapshot(`
          "[33m❯[39m Installing packages...
          [33m❯[39m Install @mantine/core, @mantine/hooks, postcss, postcss-preset-mantine, postcss-simple-vars
          [32m✔[39m Install @mantine/core, @mantine/hooks, postcss, postcss-preset-mantine, postcss-simple-vars
          [32m✔[39m Installing packages...
          [33m❯[39m Setting up Mantine...
          [32m✔[39m Setting up Mantine...
          [33m❯[39m Configuring PostCSS...
          [32m✔[39m Configuring PostCSS...
          [33m❯[39m Creating Theme File...
          [32m✔[39m Creating Theme File...
          [33m❯[39m Configure Storybook...
          [32m✔[39m Configure Storybook...
          [?25h"
        `)
        expect(p.stderr).toEqual('')

        await clean()
      },
      5_000 * 2
    )
  })

  describe('yarn rw setup ui tailwindcss', () => {
    test('--help', async () => {
      const p = await $`yarn rw setup ui tailwindcss --help`

      expect(p.exitCode).toEqual(0)
      expect(p.stdout).toMatchInlineSnapshot(`
        "rw setup ui tailwindcss

        Set up tailwindcss and PostCSS

        Options:
              --help       Show help                                           [boolean]
              --version    Show version number                                 [boolean]
              --cwd        Working directory to use (where \`redwood.toml\` is located)
              --telemetry  Whether to send anonymous usage telemetry to RedwoodJS
                                                                               [boolean]
          -f, --force      Overwrite existing configuration   [boolean] [default: false]
          -i, --install    Install packages                    [boolean] [default: true]
        "
      `)
      expect(p.stderr).toEqual('')
    })

    it(
      'works',
      async () => {
        const p = await $`yarn rw setup ui tailwindcss`

        expect(p.exitCode).toEqual(0)
        expect(p.stdout).toMatchInlineSnapshot(`
          "[33m❯[39m Installing project-wide packages...
          [33m❯[39m Install prettier-plugin-tailwindcss@0.4.1
          [32m✔[39m Install prettier-plugin-tailwindcss@0.4.1
          [32m✔[39m Installing project-wide packages...
          [33m❯[39m Installing web side packages...
          [33m❯[39m Install postcss, postcss-loader, tailwindcss, autoprefixer
          [32m✔[39m Install postcss, postcss-loader, tailwindcss, autoprefixer
          [32m✔[39m Installing web side packages...
          [33m❯[39m Configuring PostCSS...
          [32m✔[39m Configuring PostCSS...
          [33m❯[39m Initializing Tailwind CSS...
          [32m✔[39m Initializing Tailwind CSS...
          [33m❯[39m Adding directives to index.css...
          [32m✔[39m Adding directives to index.css...
          [33m❯[39m Updating tailwind 'scaffold.css'...
          [33m↓[39m Updating tailwind 'scaffold.css'... [33m[SKIPPED: Updating tailwind 'scaffold.css'...][39m
          [33m❯[39m Adding recommended VS Code extensions to project settings...
          [32m✔[39m Adding recommended VS Code extensions to project settings...
          [33m❯[39m Adding tailwind config entry in prettier...
          [32m✔[39m Adding tailwind config entry in prettier...
          [33m❯[39m Adding tailwind prettier plugin...
          [32m✔[39m Adding tailwind prettier plugin...
          [?25h"
        `)
        expect(p.stderr).toEqual('')

        await clean()
      },
      5_000 * 2
    )
  })
})
