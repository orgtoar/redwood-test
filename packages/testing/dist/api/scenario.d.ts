import { A } from 'ts-toolbelt';
/**
 * Use this function to define your scenario.
 * @example
 * export const standard = defineScenario({
 user: {
   dom: {
     name: 'Dom Saadi',
     email: 'dom@redwoodjs.com'
    }
  },
})
/* @example
* export const standard = defineScenario<Prisma.CreateUserArgs>({
 user: {
   dom: {
     name: 'Dom Saadi',
     email: 'dom@redwoodjs.com'
    }
  },
})
*/
export declare const defineScenario: DefineScenario;
export interface DefineScenario {
    <PrismaCreateType extends {
        data: any;
    }, ModelName extends string | number | symbol = string | number | symbol, KeyName extends string | number | symbol = string | number | symbol>(scenario: Record<ModelName, Record<KeyName, A.Compute<PrismaCreateType>>>): Record<ModelName, Record<KeyName, A.Compute<PrismaCreateType['data']>>>;
}
interface TestFunctionWithScenario<TData> {
    (scenario?: TData): Promise<void>;
}
export interface Scenario {
    (title: string, testFunction: TestFunctionWithScenario<any>): void;
}
export interface Scenario {
    (namedScenario: string, title: string, testFunction: TestFunctionWithScenario<any>): void;
}
export interface Scenario {
    only: Scenario;
}
export {};
//# sourceMappingURL=scenario.d.ts.map