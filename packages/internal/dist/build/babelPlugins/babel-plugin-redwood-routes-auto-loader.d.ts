import type { PluginObj, types } from '@babel/core';
interface PluginOptions {
    useStaticImports?: boolean;
}
export default function ({ types: t }: {
    types: typeof types;
}, { useStaticImports }: PluginOptions): PluginObj;
export {};
//# sourceMappingURL=babel-plugin-redwood-routes-auto-loader.d.ts.map