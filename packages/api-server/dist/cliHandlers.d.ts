import { BothServerArgs, WebServerArgs, ApiServerArgs } from './types';
export declare const commonOptions: {
    readonly port: {
        readonly default: number;
        readonly type: "number";
        readonly alias: "p";
    };
    readonly socket: {
        readonly type: "string";
    };
};
export declare const apiCliOptions: {
    readonly port: {
        readonly default: number;
        readonly type: "number";
        readonly alias: "p";
    };
    readonly socket: {
        readonly type: "string";
    };
    readonly apiRootPath: {
        readonly alias: readonly ["rootPath", "root-path"];
        readonly default: "/";
        readonly type: "string";
        readonly desc: "Root path where your api functions are served";
        readonly coerce: typeof coerceRootPath;
    };
};
export declare const webCliOptions: {
    readonly port: {
        readonly default: number;
        readonly type: "number";
        readonly alias: "p";
    };
    readonly socket: {
        readonly type: "string";
    };
    readonly apiHost: {
        readonly alias: "api-host";
        readonly type: "string";
        readonly desc: "Forward requests from the apiUrl, defined in redwood.toml to this host";
    };
};
export declare const apiServerHandler: (options: ApiServerArgs) => Promise<void>;
export declare const bothServerHandler: (options: BothServerArgs) => Promise<void>;
export declare const webServerHandler: (options: WebServerArgs) => Promise<void>;
declare function coerceRootPath(path: string): string;
export {};
//# sourceMappingURL=cliHandlers.d.ts.map