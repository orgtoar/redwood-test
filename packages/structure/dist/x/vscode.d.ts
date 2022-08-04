import * as vscode from 'vscode';
import { Connection as LSPConnection } from 'vscode-languageserver';
import { Command, Location } from 'vscode-languageserver-types';
export declare type VSCodeWindowMethods = Pick<typeof vscode.window, 'showInformationMessage' | 'showQuickPick' | 'showInputBox'> & {
    createTerminal2(props: {
        name: string;
        cwd: string;
        cmd: string;
    }): void;
} & {
    withProgress(opts: any, task: () => void): void;
};
export declare function VSCodeWindowMethods_fromConnection(connection: any): VSCodeWindowMethods;
export declare type SerializableTreeItem = ReplacePropTypes<vscode.TreeItem, {
    resourceUri: string;
    collapsibleState: TreeItemCollapsibleState2;
    iconPath: ThemeIcon2;
    command: Command;
}> & {
    id: string;
} & {
    menu?: TreeItemMenu;
};
/**
 * menus types must be known beforehand.
 * they are set up by the vscode extension in its package.json
 */
declare type TreeItemMenu = MenuCLI | MenuRoute | MenuGroup | MenuWithDoc;
interface MenuCLI {
    kind: 'cli';
    doc?: Command;
    run: Command;
}
interface MenuRoute {
    kind: 'route';
    openInBrowser?: Command;
    openComponent?: Command;
    openRoute?: Command;
}
interface MenuGroup {
    kind: 'group';
    add?: Command;
    doc?: Command;
}
interface MenuWithDoc {
    kind: 'withDoc';
    doc?: Command;
}
/**
 * Based on the actual TreeItem interface provided by VSCode.
 * It has a few differences.
 */
export declare type TreeItem2 = Partial<SerializableTreeItem> & {
    key?: string;
    children?(): vscode.ProviderResult<TreeItem2[]>;
};
export declare class TreeItem2Wrapper {
    item: TreeItem2;
    parent?: TreeItem2Wrapper | undefined;
    indexInParent: number;
    constructor(item: TreeItem2, parent?: TreeItem2Wrapper | undefined, indexInParent?: number);
    get keys(): string[];
    get key(): string;
    get id(): string;
    get collapsibleState(): TreeItemCollapsibleState2;
    children(): Promise<TreeItem2Wrapper[]>;
    findChild(key: string): Promise<TreeItem2Wrapper | undefined>;
    findChildRec(keys: string[]): Promise<TreeItem2Wrapper | undefined>;
    get serializableTreeItem(): SerializableTreeItem;
}
/**
 * https://microsoft.github.io/vscode-codicons/dist/codicon.html
 * plust a few extra icons provided by decoupled studio:
 * - redwood
 * - prisma
 * - graphql
 * - netlify
 */
declare type ThemeIcon2 = string;
/**
 * A copy of vscode.TreeItemCollapsibleState
 * we don't want to have a runtime dependency on the vscode package
 */
export declare enum TreeItemCollapsibleState2 {
    /**
     * Determines an item can be neither collapsed nor expanded. Implies it has no children.
     */
    None = 0,
    /**
     * Determines an item is collapsed
     */
    Collapsed = 1,
    /**
     * Determines an item is expanded
     */
    Expanded = 2
}
/**
 * A vscode.TreeDataProvider that uses string IDs as elements
 * and returns a SerializableTreeItem.
 */
declare type RemoteTreeDataProvider = ReplacePropTypes<vscode.TreeDataProvider<string>, {
    getTreeItem(id: string): Promise<SerializableTreeItem>;
}>;
export declare class RemoteTreeDataProviderImpl implements RemoteTreeDataProvider {
    private getRoot;
    private refreshInterval;
    constructor(getRoot: () => TreeItem2, refreshInterval?: number);
    private root;
    private refresh;
    private lazyInit;
    private listeners;
    onDidChangeTreeData(listener: (e: string | undefined) => void): any;
    getTreeItem(id: string): Promise<SerializableTreeItem>;
    getChildren(id?: string): Promise<string[]>;
}
export declare function RemoteTreeDataProvider_publishOverLSPConnection(tdp: RemoteTreeDataProvider, connection: LSPConnection, methodPrefix: string): void;
export declare function ProviderResult_normalize<T>(x: vscode.ProviderResult<T>): Promise<T | undefined>;
export declare function Command_open(uriOrLocation: string | Location): Command;
export declare function Command_cli(cmd: string, title?: string): Command;
declare type ReplacePropTypes<T extends {}, Replacements extends {}> = {
    [K in keyof T]: K extends keyof Replacements ? Replacements[K] : T[K];
};
export {};
//# sourceMappingURL=vscode.d.ts.map