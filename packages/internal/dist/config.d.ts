export declare enum TargetEnum {
    NODE = "node",
    BROWSER = "browser",
    REACT_NATIVE = "react-native",
    ELECTRON = "electron"
}
export interface NodeTargetConfig {
    title: string;
    name?: string;
    host: string;
    port: number;
    path: string;
    target: TargetEnum.NODE;
    schemaPath: string;
    serverConfig: string;
    debugPort?: number;
}
interface BrowserTargetConfig {
    title: string;
    name?: string;
    host: string;
    port: number;
    path: string;
    target: TargetEnum.BROWSER;
    /**
     * Specify the URL to your api-server.
     * This can be an absolute path proxied on the current domain (`/.netlify/functions`),
     * or a fully qualified URL (`https://api.example.org:8911/functions`).
     *
     * Note: This should not include the path to the GraphQL Server.
     **/
    apiUrl: string;
    /**
     * Optional: FQDN or absolute path to the GraphQL serverless function, without the trailing slash.
     * This will override the apiUrl configuration just for the graphql function
     * Example: `./redwood/functions/graphql` or `https://api.redwoodjs.com/graphql`
     */
    apiGraphQLUrl?: string;
    /**
     * Optional: FQDN or absolute path to the DbAuth serverless function, without the trailing slash.
     * This will override the apiUrl configuration just for the dbAuth function
     * Example: `./redwood/functions/auth` or `https://api.redwoodjs.com/auth`
     **/
    apiDbAuthUrl?: string;
    fastRefresh: boolean;
    a11y: boolean;
    sourceMap: boolean;
}
export interface Config {
    web: BrowserTargetConfig;
    api: NodeTargetConfig;
    browser: {
        open: boolean | string;
    };
    generate: {
        tests: boolean;
        stories: boolean;
        nestScaffoldByModel: boolean;
    };
}
/**
 * These configuration options are modified by the user via the Redwood
 * config file.
 */
export declare const getConfig: (configPath?: string) => Config;
export {};
//# sourceMappingURL=config.d.ts.map