import { RWProject } from '../model/RWProject';
import { RedwoodCommandString } from './RedwoodCommandString';
import { UI } from './ui';
export interface Opts {
    cmd: RedwoodCommandString;
    project: RWProject;
    ui: UI;
}
export declare function command_builder(opts: Opts): Promise<RedwoodCommandString | undefined>;
//# sourceMappingURL=command_builder.d.ts.map