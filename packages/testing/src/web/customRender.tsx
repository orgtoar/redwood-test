import React from 'react'

import { render, renderHook } from '@testing-library/react'
import type {
  RenderResult,
  RenderHookOptions,
  RenderHookResult,
} from '@testing-library/react'

import { MockProviders } from './MockProviders'

export const customRender = (
  ui: React.ReactElement,
  options = {}
): RenderResult => {
  return render(ui, {
    wrapper: (props) => <MockProviders {...props} />,
    ...options,
  })
}

export const customRenderHook = <Props, Result>(
  render: (props: Props) => Result,
  options?: RenderHookOptions<Props>
): RenderHookResult<Result, Props> => {
  return renderHook(render, {
    wrapper: (props: any) => <MockProviders {...props} />,
    ...options,
  })
}
