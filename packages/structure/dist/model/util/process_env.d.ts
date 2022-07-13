import * as tsm from 'ts-morph';
export declare function process_env_findAll(dir: string): ({
    key: string;
    node: tsm.PropertyAccessExpression<tsm.ts.PropertyAccessExpression>;
} | {
    key: string;
    node: tsm.ElementAccessExpression<tsm.ts.ElementAccessExpression>;
})[];
export declare function process_env_findInFile(filePath: string, text: string): ({
    key: string;
    node: tsm.PropertyAccessExpression<tsm.ts.PropertyAccessExpression>;
} | {
    key: string;
    node: tsm.ElementAccessExpression<tsm.ts.ElementAccessExpression>;
})[];
export declare function process_env_findInFile2(sf: tsm.SourceFile): ({
    key: string;
    node: tsm.PropertyAccessExpression<tsm.ts.PropertyAccessExpression>;
} | {
    key: string;
    node: tsm.ElementAccessExpression<tsm.ts.ElementAccessExpression>;
})[];
//# sourceMappingURL=process_env.d.ts.map