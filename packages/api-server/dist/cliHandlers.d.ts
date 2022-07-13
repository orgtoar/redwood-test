import type { HttpServerParams } from './server';
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
interface ApiServerArgs extends Omit<HttpServerParams, 'app'> {
    apiRootPath: string;
}
export declare const apiServerHandler: ({ port, socket, apiRootPath, }: ApiServerArgs) => Promise<void>;
export declare const bothServerHandler: ({ port, socket, }: Omit<HttpServerParams, 'app'>) => Promise<void>;
interface WebServerArgs extends Omit<HttpServerParams, 'app'> {
    apiHost?: string;
}
export declare const webServerHandler: ({ port, socket, apiHost }: WebServerArgs) => void;
declare function coerceRootPath(path: string): string;
export {};
//# sourceMappingURL=cliHandlers.d.ts.map