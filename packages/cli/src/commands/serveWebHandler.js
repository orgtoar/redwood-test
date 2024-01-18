import execa from 'execa'

import { getPaths } from '@redwoodjs/project-config'
import { serve } from '@redwoodjs/web-server'

export const webServerHandler = async (argv) => serve(argv)

export const webSsrServerHandler = async () => {
  await execa('yarn', ['rw-serve-fe'], {
    cwd: getPaths().web.base,
    stdio: 'inherit',
    shell: true,
  })
}
