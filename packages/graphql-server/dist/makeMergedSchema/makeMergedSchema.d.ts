import { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import type { GraphQLSchema } from 'graphql';
import type { RedwoodDirective } from '../plugins/useRedwoodDirective';
import { ServicesGlobImports, SdlGlobImports } from '../types';
export declare const makeMergedSchema: ({ sdls, services, schemaOptions, directives, }: {
    sdls: SdlGlobImports;
    services: ServicesGlobImports;
    directives: RedwoodDirective[];
    /**
     * A list of options passed to [makeExecutableSchema](https://www.graphql-tools.com/docs/generate-schema/#makeexecutableschemaoptions).
     */
    schemaOptions?: Partial<IExecutableSchemaDefinition<any>> | undefined;
}) => GraphQLSchema;
//# sourceMappingURL=makeMergedSchema.d.ts.map