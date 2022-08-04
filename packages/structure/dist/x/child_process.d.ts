/// <reference types="node" />
import * as child_process from 'child_process';
export declare type SpawnOut = {
    stderr: string;
    stdout: string;
    code: number | null;
};
export declare function spawnCancellable(cmd: string, args: string[], opts?: child_process.SpawnOptions & {
    stdout_cb?: (x: any) => void;
    stderr_cb?: (x: any) => void;
}): CancellablePromise<SpawnOut>;
export declare type CancellablePromise<T> = Promise<T> & {
    cancel: () => void;
};
export declare function CancellablePromise_then<T, U>(p: CancellablePromise<T>, f: (t: T) => U): CancellablePromise<T>;
//# sourceMappingURL=child_process.d.ts.map