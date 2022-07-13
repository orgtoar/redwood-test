import type { TransformOptions } from '@babel/core';
import * as babel from '@babel/core';
import { RegisterHookOptions } from './common';
export declare const getApiSideBabelPresets: ({ presetEnv }?: {
    presetEnv: boolean;
}) => babel.PluginItem[] | null | undefined;
export declare const getApiSideBabelPlugins: ({ forJest }?: {
    forJest: boolean;
}) => babel.PluginItem[];
export declare const getApiSideBabelConfigPath: () => string | undefined;
export declare const getApiSideDefaultBabelConfig: () => {
    presets: babel.PluginItem[] | null | undefined;
    plugins: babel.PluginItem[];
    extends: string | undefined;
    babelrc: boolean;
    ignore: string[];
};
export declare const registerApiSideBabelHook: ({ plugins, ...rest }?: RegisterHookOptions) => void;
export declare const prebuildApiFile: (srcPath: string, dstPath: string, plugins: TransformOptions['plugins']) => babel.BabelFileResult | null;
//# sourceMappingURL=api.d.ts.map