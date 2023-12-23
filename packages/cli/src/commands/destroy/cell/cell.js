import { files as cellFiles } from '../../generate/cell/cellHandler'
import { createYargsForComponentDestroy } from '../helpers'

export const { command, description, builder, handler, tasks } =
  createYargsForComponentDestroy({
    componentName: 'cell',
    filesFn: cellFiles,
  })
