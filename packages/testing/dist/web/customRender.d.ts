import React from 'react';
import type { RenderResult } from '@testing-library/react';
import type { RenderHookOptions, RenderHookResult } from '@testing-library/react-hooks';
export declare const customRender: (ui: React.ReactElement, options?: {}) => RenderResult;
export declare const customRenderHook: <Props, Result>(render: (props: Props) => Result, options?: RenderHookOptions<Props> | undefined) => RenderHookResult<Props, Result, import("@testing-library/react-hooks").Renderer<Props>>;
//# sourceMappingURL=customRender.d.ts.map