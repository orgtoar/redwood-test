import { QueryInfo } from '@redwoodjs/web';
export declare class PrerenderGqlError {
    message: string;
    stack: string;
    constructor(message: string);
}
interface PrerenderParams {
    queryCache: Record<string, QueryInfo>;
    renderPath: string;
}
export declare const runPrerender: ({ queryCache, renderPath, }: PrerenderParams) => Promise<string | void>;
export declare const writePrerenderedHtmlFile: (outputHtmlPath: string, content: string) => void;
export {};
//# sourceMappingURL=runPrerender.d.ts.map