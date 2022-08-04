import React from 'react';
import { useAuth } from '@redwoodjs/auth';
import type { ParamType } from './util';
export interface RouterState {
    paramTypes?: Record<string, ParamType>;
    useAuth: typeof useAuth;
}
export interface RouterSetContextProps {
    setState: (newState: Partial<RouterState>) => void;
}
export interface RouterContextProviderProps extends Omit<RouterState, 'useAuth'> {
    useAuth?: typeof useAuth;
}
export declare const RouterContextProvider: React.FC<RouterContextProviderProps>;
export declare const useRouterState: () => RouterState;
export declare const useRouterStateSetter: () => React.Dispatch<Partial<RouterState>>;
//# sourceMappingURL=router-context.d.ts.map