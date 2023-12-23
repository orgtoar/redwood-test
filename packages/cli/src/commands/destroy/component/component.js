import { files as componentFiles } from '../../generate/component/componentHandler'
import { createYargsForComponentDestroy } from '../helpers'

export const description = 'Destroy a component'

export const { command, builder, handler, tasks } =
  createYargsForComponentDestroy({
    componentName: 'component',
    filesFn: componentFiles,
  })
