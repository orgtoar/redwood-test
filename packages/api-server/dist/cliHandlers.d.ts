import { coerceRootPath } from '@redwoodjs/fastify-web';
import type { BothServerArgs, ApiServerArgs } from './types';
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
        readonly alias: readonly ["api-root-path", "rootPath", "root-path"];
        readonly default: "/";
        readonly type: "string";
        readonly desc: "Root path where your api functions are served";
        readonly coerce: typeof coerceRootPath;
    };
    readonly loadEnvFiles: {
        readonly description: "Deprecated; env files are always loaded. This flag is a no-op";
        readonly type: "boolean";
        readonly hidden: true;
    };
};
export declare const apiServerHandler: (options: ApiServerArgs) => Promise<void>;
export declare const bothServerHandler: (options: BothServerArgs) => Promise<void>;
export { createServer } from './createServer';
//# sourceMappingURL=cliHandlers.d.ts.map