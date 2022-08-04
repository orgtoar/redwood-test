/// <reference types="react" />
declare type ErrorWithRequestMeta = Error & {
    mostRecentRequest?: {
        query: string;
        operationName: string;
        operationKind: string;
        variables: any;
    };
    mostRecentResponse?: any;
};
export declare const DevFatalErrorPage: (props: {
    error?: ErrorWithRequestMeta;
}) => JSX.Element;
export {};
//# sourceMappingURL=DevFatalErrorPage.d.ts.map