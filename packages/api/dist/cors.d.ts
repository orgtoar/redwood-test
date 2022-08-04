import type { Request } from './transforms';
export declare type CorsConfig = {
    origin?: boolean | string | string[];
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
};
export declare type CorsHeaders = Record<string, string>;
export declare type CorsContext = ReturnType<typeof createCorsContext>;
export declare function createCorsContext(cors: CorsConfig | undefined): {
    shouldHandleCors(request: Request): boolean;
    getRequestHeaders(request: Request): CorsHeaders;
};
//# sourceMappingURL=cors.d.ts.map