import { Connection } from 'vscode-languageserver';
/**
 * will monkey patch the connection object
 * so that any errors thrown by subsequently installed handlers are caught and logged
 * (ex: connection.onHover(() => throw new Error('oops!')))
 * this prevents the LSP client, on the other end, to receive errors
 * which can sometimes cause error messages to pop-up uncontrollably
 *
 * @param conn
 */
export declare function Connection_suppressErrors<T extends Connection>(conn: T): void;
//# sourceMappingURL=vscode-languageserver.d.ts.map