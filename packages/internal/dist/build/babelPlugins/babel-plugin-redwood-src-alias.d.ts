import type { PluginObj, types } from '@babel/core';
export default function ({ types: t }: {
    types: typeof types;
}, options: {
    /** absolute path to the `src` directory */
    srcAbsPath: string;
}): PluginObj;
//# sourceMappingURL=babel-plugin-redwood-src-alias.d.ts.map