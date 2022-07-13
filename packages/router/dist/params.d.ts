import React from 'react';
import { LocationContextType } from './location';
export interface ParamsContextProps {
    params: Record<string, string>;
}
export declare const ParamsContext: React.Context<ParamsContextProps | undefined>;
interface Props {
    path?: string;
    location?: LocationContextType;
}
export declare const ParamsProvider: React.FC<Props>;
export declare const useParams: () => Record<string, string>;
export {};
//# sourceMappingURL=params.d.ts.map