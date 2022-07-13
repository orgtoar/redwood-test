import * as tsm from 'ts-morph';
import { Location } from 'vscode-languageserver';
import { BaseNode, CodeLensX, Definition, HoverX, Reference } from '../ide';
import { ExtendedDiagnostic } from '../x/vscode-languageserver-types';
import { RWProject } from './RWProject';
declare type EnvVarMap = Record<string, string>;
export declare class RWEnvHelper extends BaseNode {
    parent: RWProject;
    constructor(parent: RWProject);
    get id(): string;
    bailOutOnCollection(): boolean;
    /**
     * parse .env
     * return undefined if not present
     * NOTE: It does not apply defaults (see env_merged)
     */
    get env(): EnvVarMap | undefined;
    /**
     * .env.defaults
     * return undefined if not present
     */
    get env_defaults(): EnvVarMap | undefined;
    get api_prisma_env(): any;
    /**
     * .env.defaults + .env
     * uses the same algorithm that env-defaults does (Object.assign(), which is equivalent to object spread addition)
     */
    get env_default_merged(): EnvVarMap;
    /**
     * - starts with .env + .env.defaults
     * - allows any variables prefixed with 'REDWOOD_ENV_'
     * - applies the "include" rule on the rest
     * @param include
     */
    private env_default_merged_filtered;
    private _dotenv;
    get env_available_to_api(): EnvVarMap;
    get env_available_to_web(): EnvVarMap;
    children(): ProcessDotEnvExpression[];
    get process_env_expressions(): ProcessDotEnvExpression[];
}
/**
 * An occurence of process.env somewhere in the codebase
 */
declare class ProcessDotEnvExpression extends BaseNode {
    parent: RWEnvHelper;
    kind: 'api' | 'web' | 'prisma';
    key: string;
    node: tsm.Node | Location;
    constructor(parent: RWEnvHelper, kind: 'api' | 'web' | 'prisma', key: string, node: tsm.Node | Location);
    bailOutOnCollection(uri: string): boolean;
    get id(): string;
    get side(): "api" | "web";
    get location(): Location;
    ideInfo(): Generator<Definition | Reference | CodeLensX | HoverX, void, unknown>;
    diagnostics(): Generator<ExtendedDiagnostic, void, unknown>;
    get value_definition_file_basename(): ".env" | ".env.defaults" | undefined;
    get value_definition_location(): Location | undefined;
    get value_as_available(): string;
    private render;
}
export {};
//# sourceMappingURL=RWEnvHelper.d.ts.map