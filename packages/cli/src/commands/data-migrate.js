import terminalLink from 'terminal-link'

export const command = 'data-migrate <command>'
export const aliases = ['dm', 'dataMigrate']
export const description = 'Migrate the data in your database'

export async function builder(yargs) {
  yargs
    .demandCommand()
    .epilogue(
      `Also see the ${terminalLink(
        'Redwood CLI Reference',
        'https://redwoodjs.com/docs/cli-commands#datamigrate'
      )}`
    )

  const dataMigrateInstallCommand = await import(
    './commands/dataMigrate/install'
  )
  const dataMigrateUpCommand = await import('./commands/dataMigrate/up')

  for (const dataMigrateCommand of [
    dataMigrateInstallCommand,
    dataMigrateUpCommand,
  ]) {
    yargs.command(dataMigrateCommand)
  }
}
