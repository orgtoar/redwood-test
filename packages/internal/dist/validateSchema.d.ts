import { DocumentNode } from 'graphql';
export declare const DIRECTIVE_REQUIRED_ERROR_MESSAGE = "You must specify one of @requireAuth, @skipAuth or a custom directive";
export declare const DIRECTIVE_INVALID_ROLE_TYPES_ERROR_MESSAGE = "Please check that the requireAuth roles is a string or an array of strings.";
export declare function validateSchemaForDirectives(schemaDocumentNode: DocumentNode, typesToCheck?: string[]): void;
export declare const loadAndValidateSdls: () => Promise<void>;
//# sourceMappingURL=validateSchema.d.ts.map