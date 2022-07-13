import * as tsm from 'ts-morph';
import { RWComponent } from './RWComponent';
export declare class RWCell extends RWComponent {
    /**
     * A "Cell" is a component that ends in `Cell.{js, jsx, tsx}`, has no
     * default export AND exports `QUERY`
     **/
    get isCell(): boolean;
    get queryStringNode(): tsm.NoSubstitutionTemplateLiteral | undefined;
    get queryString(): string | undefined;
    get queryAst(): import("graphql").DocumentNode | undefined;
    get queryOperationName(): string | undefined;
    diagnostics(): Generator<import("../x/vscode-languageserver-types").ExtendedDiagnostic | {
        uri: string;
        diagnostic: {
            range: import("vscode-languageserver-types").Range;
            message: any;
            severity: 1;
        };
    }, void, unknown>;
}
//# sourceMappingURL=RWCell.d.ts.map