import { files as layoutFiles } from '../../generate/layout/layoutHandler'
import { createYargsForComponentDestroy } from '../helpers'

export const { command, description, builder, handler, tasks } =
  createYargsForComponentDestroy({
    componentName: 'layout',
    filesFn: layoutFiles,
  })
