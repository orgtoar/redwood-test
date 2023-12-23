import { files as directiveFiles } from '../../generate/directive/directiveHandler'
import { createYargsForComponentDestroy } from '../helpers'

export const description = 'Destroy a directive'

export const { command, handler, builder, tasks } =
  createYargsForComponentDestroy({
    componentName: 'directive',
    filesFn: (args) => directiveFiles({ ...args, type: 'validator' }),
  })
