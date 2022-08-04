import type { types } from '@babel/core';
interface JsxElement {
    name: string;
    props: Record<string, any>;
    children?: JsxElement[];
}
/**
 * Extract JSX elements, children and props from static code.
 */
export declare const getJsxElements: (ast: types.Node, name: string) => JsxElement[];
export {};
//# sourceMappingURL=jsx.d.ts.map