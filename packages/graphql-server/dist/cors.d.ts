import { CorsConfig } from '@redwoodjs/api';
export declare const mapRwCorsOptionsToYoga: (rwCorsConfig?: CorsConfig, requestOrigin?: string | null) => false | {
    origin?: string | string[] | undefined;
    methods?: string[] | undefined;
    allowedHeaders?: string[] | undefined;
    exposedHeaders?: string[] | undefined;
    credentials?: boolean | undefined;
    maxAge?: number | undefined;
};
//# sourceMappingURL=cors.d.ts.map