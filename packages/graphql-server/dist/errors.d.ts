import { GraphQLYogaError } from '@graphql-yoga/common';
export declare class RedwoodGraphQLError extends GraphQLYogaError {
    constructor(message: string, extensions?: Record<string, any>);
}
export declare class SyntaxError extends RedwoodGraphQLError {
    constructor(message: string);
}
export declare class ValidationError extends RedwoodGraphQLError {
    constructor(message: string);
}
export declare class AuthenticationError extends RedwoodGraphQLError {
    constructor(message: string);
}
export declare class ForbiddenError extends RedwoodGraphQLError {
    constructor(message: string);
}
export declare class PersistedQueryNotFoundError extends RedwoodGraphQLError {
    constructor();
}
export declare class PersistedQueryNotSupportedError extends RedwoodGraphQLError {
    constructor();
}
export declare class UserInputError extends RedwoodGraphQLError {
    constructor(message: string, properties?: Record<string, any>);
}
//# sourceMappingURL=errors.d.ts.map