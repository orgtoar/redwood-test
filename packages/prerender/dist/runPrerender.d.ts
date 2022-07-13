interface PrerenderParams {
    routerPath: string;
}
export declare const runPrerender: ({ routerPath, }: PrerenderParams) => Promise<string | void>;
export declare const writePrerenderedHtmlFile: (outputHtmlPath: string, content: string) => void;
export {};
//# sourceMappingURL=runPrerender.d.ts.map