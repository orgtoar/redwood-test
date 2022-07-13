import { VSCodeWindowMethods } from '../x/vscode';
export declare type UIPickItem = {
    label: string;
    description?: string;
    picked?: boolean;
};
export declare function UIPickItem_normalize(item: UIPickItem | string): UIPickItem;
export interface UI {
    info(msg: string): Promise<void>;
    prompt(msg: string, opts?: {
        value?: string;
        valueSelection?: any;
        validateInput?: any;
    }): Promise<string | undefined>;
    pickOne(items: (string | UIPickItem)[], msg: string): Promise<string | undefined>;
    pickMany(items: (string | UIPickItem)[], msg: string): Promise<string[] | undefined>;
}
export declare class VSCodeWindowUI implements UI {
    private w;
    constructor(w: VSCodeWindowMethods);
    info(msg: string): Promise<void>;
    prompt(msg: string, opts: any): Promise<string | undefined>;
    pickOne(items: (string | UIPickItem)[], msg: string): Promise<string | undefined>;
    pickMany(items: (string | UIPickItem)[], msg: string): Promise<string[] | undefined>;
}
export declare class CLIUI implements UI {
    info(msg: string): Promise<void>;
    prompt(msg: string): Promise<string | undefined>;
    pickOne(items: (string | UIPickItem)[], msg: string): Promise<string | undefined>;
    pickMany(items: (string | UIPickItem)[], msg: string): Promise<string[] | undefined>;
}
//# sourceMappingURL=ui.d.ts.map