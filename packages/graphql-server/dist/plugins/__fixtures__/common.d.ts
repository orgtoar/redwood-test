export declare const testSchema: import("graphql").GraphQLSchema;
export declare const testQuery = "\n  query meQuery {\n    me {\n      id\n      name\n    }\n  }\n";
export declare const testFilteredQuery = "\n  query FilteredQuery {\n    me {\n      id\n      name\n    }\n  }\n";
export declare const testErrorQuery = "\n  query forbiddenUserQuery {\n    forbiddenUser {\n      id\n      name\n    }\n  }\n";
export declare const testParseErrorQuery = "\n  query ParseErrorQuery {\n    me {\n      id\n      name\n      unknown_field\n    }\n  }\n";
export declare const testValidationErrorQuery = "\n  query ValidationErrorQuery(id: Int!) {\n    getUser(id: 'one') {\n      id\n      name\n    }\n  }\n";
//# sourceMappingURL=common.d.ts.map