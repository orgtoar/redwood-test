/// <reference types="react" />
import { GraphQLError } from 'graphql';
export interface ServerParseError extends Error {
    response: Response;
    statusCode: number;
    bodyText: string;
}
export interface ServerError extends Error {
    response: Response;
    statusCode: number;
    result: Record<string, any>;
}
export interface RWGqlError {
    message: string;
    graphQLErrors: ReadonlyArray<GraphQLError>;
    networkError: Error | ServerParseError | ServerError | null;
}
export declare type RwGqlErrorProperties = Record<string, Record<string, string[]>>;
interface FormErrorProps {
    error?: RWGqlError;
    wrapperClassName?: string;
    wrapperStyle?: React.CSSProperties;
    titleClassName?: string;
    titleStyle?: React.CSSProperties;
    listClassName?: string;
    listStyle?: React.CSSProperties;
    listItemClassName?: string;
    listItemStyle?: React.CSSProperties;
}
/**
 * Big error message at the top of the page explaining everything that's wrong
 * with the form fields in this form
 */
declare const FormError: ({ error, wrapperClassName, wrapperStyle, titleClassName, titleStyle, listClassName, listStyle, listItemClassName, listItemStyle, }: FormErrorProps) => JSX.Element | null;
export default FormError;
//# sourceMappingURL=FormError.d.ts.map