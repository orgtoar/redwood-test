import * as tsm from 'ts-morph';
import { BaseNode } from '../ide';
import { ExtendedDiagnostic } from '../x/vscode-languageserver-types';
import { RWSDLField } from './RWSDLField';
import { RWService } from './RWService';
export declare class RWServiceFunction extends BaseNode {
    name: string;
    node: tsm.FunctionDeclaration | tsm.ArrowFunction;
    parent: RWService;
    constructor(name: string, node: tsm.FunctionDeclaration | tsm.ArrowFunction, parent: RWService);
    get id(): string;
    /**
     * The SDL field that this function implements, if any
     * TODO: describe this in prose.
     */
    get sdlField(): RWSDLField | undefined;
    get parameterNames(): string[];
    diagnostics(): Generator<ExtendedDiagnostic, void, unknown>;
}
//# sourceMappingURL=RWServiceFunction.d.ts.map