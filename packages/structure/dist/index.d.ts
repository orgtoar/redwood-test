export { DefaultHost, Host } from './hosts';
export { RWProject } from './model';
import { DefaultHost } from './hosts';
import { RWProject } from './model';
import { GetSeverityLabelFunction } from './x/vscode-languageserver-types';
export { DiagnosticSeverity } from 'vscode-languageserver-types';
export declare function getProject(projectRoot: string, host?: DefaultHost): RWProject;
export declare function printDiagnostics(projectRoot: string, opts?: {
    getSeverityLabel?: GetSeverityLabelFunction;
}): Promise<void>;
export { URL_file } from './x/URL';
//# sourceMappingURL=index.d.ts.map