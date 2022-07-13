import * as babel from '@babel/core';
import { RegisterHookOptions } from './common';
export declare const getWebSideBabelPlugins: ({ forJest }?: Flags) => babel.PluginItem[];
export declare const getWebSideOverrides: ({ staticImports }?: Flags) => babel.TransformOptions[];
export declare const getWebSideBabelPresets: () => ((string | undefined)[] | (string | {
    useBuiltIns: string;
    corejs: {
        version: any;
        proposals: boolean;
    };
    exclude: string[];
})[])[];
export declare const getWebSideBabelConfigPath: () => string | undefined;
export interface Flags {
    forJest?: boolean;
    staticImports?: boolean;
}
export declare const getWebSideDefaultBabelConfig: (options?: Flags) => {
    presets: ((string | undefined)[] | (string | {
        useBuiltIns: string;
        corejs: {
            version: any;
            proposals: boolean;
        };
        exclude: string[];
    })[])[];
    plugins: babel.PluginItem[];
    overrides: babel.TransformOptions[];
    extends: string | undefined;
    babelrc: boolean;
    ignore: string[];
};
export declare const registerWebSideBabelHook: ({ plugins, overrides, }?: RegisterHookOptions) => void;
export declare const prebuildWebFile: (srcPath: string, flags?: Flags) => babel.BabelFileResult | null;
//# sourceMappingURL=web.d.ts.map