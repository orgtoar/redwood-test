import type _React from 'react';
import type _gql from 'graphql-tag';
import type _PropTypes from 'prop-types';
declare global {
    const React: typeof _React;
    const PropTypes: typeof _PropTypes;
    const gql: typeof _gql;
    interface Window {
        /** URL or absolute path to the DbAuth serverless function */
        RWJS_API_DBAUTH_URL: string;
        /** URL or absolute path to the GraphQL serverless function */
        RWJS_API_GRAPHQL_URL: string;
        /** URL or absolute path to serverless functions */
        RWJS_API_URL: string;
        __REDWOOD__APP_TITLE: string;
    }
    type GraphQLOperationVariables = Record<string, any>;
    interface QueryOperationResult<TData = any, TVariables = GraphQLOperationVariables> {
        data: TData | undefined;
        loading: boolean;
    }
    interface MutationOperationResult<TData, TVariables> {
    }
    interface GraphQLQueryHookOptions<TData, TVariables> {
        variables?: TVariables;
        [key: string]: any;
    }
    export interface GraphQLMutationHookOptions<TData, TVariables> {
        variables?: TVariables;
        onCompleted?: (data: TData) => void;
        [key: string]: any;
    }
}
//# sourceMappingURL=global.web-auto-imports.d.ts.map