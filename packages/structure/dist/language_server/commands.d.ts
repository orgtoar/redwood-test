import { ExecuteCommandOptions } from 'vscode-languageserver';
import { RWLanguageServer } from './RWLanguageServer';
export declare const redwoodjs_commands: {
    'redwoodjs.cli': string;
};
export declare type CommandID = keyof typeof redwoodjs_commands;
export declare class CommandsManager {
    server: RWLanguageServer;
    constructor(server: RWLanguageServer);
    get options(): ExecuteCommandOptions;
    start(): void;
    private command__cli;
}
//# sourceMappingURL=commands.d.ts.map