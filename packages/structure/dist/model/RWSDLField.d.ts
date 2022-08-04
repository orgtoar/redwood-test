import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql/language/ast';
import { CodeAction, Location } from 'vscode-languageserver-types';
import { BaseNode, Implementation } from '../ide';
import { ExtendedDiagnostic } from '../x/vscode-languageserver-types';
import { RWSDL } from './RWSDL';
import { RWServiceFunction } from './RWServiceFunction';
export declare class RWSDLField extends BaseNode {
    objectTypeDef: ObjectTypeDefinitionNode;
    field: FieldDefinitionNode;
    parent: RWSDL;
    constructor(objectTypeDef: ObjectTypeDefinitionNode, field: FieldDefinitionNode, parent: RWSDL);
    get id(): string;
    /**
     * The location of this field.
     * Calculating this is slightly complicated since it is embedded within a TaggedTemplateLiteral
     */
    get location(): Location;
    get name(): string;
    get argumentNames(): string[];
    ideInfo(): Generator<Implementation, void, unknown>;
    /**
     * TODO: describe in prose what is going on here.
     * this is an important rule
     */
    get impl(): RWServiceFunction | undefined;
    private get defaultImplSnippet();
    get quickFix_addImplementation(): CodeAction;
    diagnostics(): Generator<ExtendedDiagnostic, void, unknown>;
}
//# sourceMappingURL=RWSDLField.d.ts.map