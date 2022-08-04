export declare type ArrayLike<T> = T[] | Promise<T[]> | IterableIterator<T> | undefined | void | null;
export declare function ArrayLike_normalize<T>(x: ArrayLike<T>): Promise<T[]>;
export declare function iter<T>(f: () => IterableIterator<T>): T[];
//# sourceMappingURL=Array.d.ts.map