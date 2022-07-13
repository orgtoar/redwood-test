import type { PluginObj, types } from '@babel/core';
/**
 * This babel plugin will search for import statements that include star `**`
 * in the source part of the statement is a glob, the files that are matched are imported,
 * and appended to an object.
 *
 * @example:
 * Given a directory "src/services" that contains "a.js" and "b.ts", "nested/c.js",
 * will produce the following results:
 * ```js
 * import services from 'src/services/**\/*.{js,ts}'
 * console.log(services)
 * // services.a = require('src/services/a.js')
 * // services.b = require('src/services/b.ts')
 * // services.nested_c = require('src/services/nested/c.js')
 * ```
 */
export default function ({ types: t }: {
    types: typeof types;
}): PluginObj;
//# sourceMappingURL=babel-plugin-redwood-import-dir.d.ts.map