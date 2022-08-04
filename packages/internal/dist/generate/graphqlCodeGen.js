"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getResolverFnType = exports.generateTypeDefGraphQLWeb = exports.generateTypeDefGraphQLApi = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _cli = require("@graphql-codegen/cli");

var _core = require("@graphql-codegen/core");

var typescriptPlugin = _interopRequireWildcard(require("@graphql-codegen/typescript"));

var typescriptOperations = _interopRequireWildcard(require("@graphql-codegen/typescript-operations"));

var typescriptResolvers = _interopRequireWildcard(require("@graphql-codegen/typescript-resolvers"));

var _codeFileLoader = require("@graphql-tools/code-file-loader");

var _graphqlFileLoader = require("@graphql-tools/graphql-file-loader");

var _load = require("@graphql-tools/load");

var _paths = require("../paths");

var _project = require("../project");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// import * as add from '@graphql-codegen/add'
const generateTypeDefGraphQLApi = async () => {
  const filename = _path.default.join((0, _paths.getPaths)().api.types, 'graphql.d.ts');

  const extraPlugins = [{
    name: 'typescript-resolvers',
    options: {},
    codegenPlugin: typescriptResolvers
  }];

  try {
    return await runCodegenGraphQL([], extraPlugins, filename);
  } catch (e) {
    console.error();
    console.error('Error: Could not generate GraphQL type definitions (api)');
    console.error(e);
    console.error();
    return [];
  }
};

exports.generateTypeDefGraphQLApi = generateTypeDefGraphQLApi;

const generateTypeDefGraphQLWeb = async () => {
  const filename = _path.default.join((0, _paths.getPaths)().web.types, 'graphql.d.ts');

  const options = getLoadDocumentsOptions(filename);
  const documentsGlob = './web/src/**/!(*.d).{ts,tsx,js,jsx}';
  let documents;

  try {
    documents = await (0, _load.loadDocuments)([documentsGlob], options);
  } catch {
    // No GraphQL documents present, no need to try to run codegen
    return [];
  }

  const extraPlugins = [{
    name: 'typescript-operations',
    options: {},
    codegenPlugin: typescriptOperations
  }];

  try {
    return await runCodegenGraphQL(documents, extraPlugins, filename);
  } catch (e) {
    console.error();
    console.error('Error: Could not generate GraphQL type definitions (web)');
    console.error(e);
    console.error();
    return [];
  }
};
/**
 * This is the function used internally by generateTypeDefGraphQLApi and generateTypeDefGraphQLWeb
 * And contains the base configuration for generating gql types with codegen
 *
 * Named a little differently to make it easier to spot
 */


exports.generateTypeDefGraphQLWeb = generateTypeDefGraphQLWeb;

async function runCodegenGraphQL(documents, extraPlugins, filename) {
  var _userCodegenConfig$co;

  const userCodegenConfig = await (0, _cli.loadCodegenConfig)({
    configFilePath: (0, _paths.getPaths)().base
  }); // Merge in user codegen config with the rw built-in one

  const mergedConfig = { ...getPluginConfig(),
    ...(userCodegenConfig === null || userCodegenConfig === void 0 ? void 0 : (_userCodegenConfig$co = userCodegenConfig.config) === null || _userCodegenConfig$co === void 0 ? void 0 : _userCodegenConfig$co.config)
  };
  const options = getCodegenOptions(documents, mergedConfig, extraPlugins);
  const output = await (0, _core.codegen)(options);

  _fs.default.mkdirSync(_path.default.dirname(filename), {
    recursive: true
  });

  _fs.default.writeFileSync(filename, output);

  return [filename];
}

function getLoadDocumentsOptions(filename) {
  const loadTypedefsConfig = {
    cwd: (0, _paths.getPaths)().base,
    ignore: [_path.default.join(process.cwd(), filename)],
    loaders: [new _codeFileLoader.CodeFileLoader()],
    sort: true
  };
  return loadTypedefsConfig;
}

function getPluginConfig() {
  let prismaModels = {};

  try {
    // Extract the models from the prisma client and use those to
    // set up internal redirects for the return values in resolvers.
    const localPrisma = require('@prisma/client');

    prismaModels = localPrisma.ModelName;
    Object.keys(prismaModels).forEach(key => {
      prismaModels[key] = `@prisma/client#${key} as Prisma${key}`;
    }); // This isn't really something you'd put in the GraphQL API, so
    // we can skip the model.

    if (prismaModels.RW_DataMigration) {
      delete prismaModels.RW_DataMigration;
    } // Include Prisma's JSON field types as these types exist to match the types supported by JSON.parse()
    // see: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields
    // We're doing this to avoid adding an extra import statement just for the Prisma namespace


    prismaModels['JSON'] = `.prisma/client#Prisma`;
  } catch (error) {// This means they've not set up prisma types yet
  }

  const pluginConfig = {
    makeResolverTypeCallable: true,
    namingConvention: 'keep',
    // to allow camelCased query names
    scalars: {
      // We need these, otherwise these scalars are mapped to any
      BigInt: 'number',
      DateTime: 'string',
      Date: 'string',
      JSON: 'Prisma.JsonValue',
      JSONObject: 'Prisma.JsonObject',
      Time: 'string'
    },
    // prevent type names being PetQueryQuery, RW generators already append
    // Query/Mutation/etc
    omitOperationSuffix: true,
    showUnusedMappers: false,
    customResolverFn: getResolverFnType(),
    mappers: prismaModels,
    avoidOptionals: {
      resolvers: true
    },
    contextType: `@redwoodjs/graphql-server/dist/functions/types#RedwoodGraphQLContext`
  };
  return pluginConfig;
}

const getResolverFnType = () => {
  var _tsConfig$api, _tsConfig$api$compile;

  const tsConfig = (0, _project.getTsConfigs)();

  if ((_tsConfig$api = tsConfig.api) !== null && _tsConfig$api !== void 0 && (_tsConfig$api$compile = _tsConfig$api.compilerOptions) !== null && _tsConfig$api$compile !== void 0 && _tsConfig$api$compile.strict) {
    // In strict mode, bring a world of pain to the tests
    return `(
      args: TArgs,
      obj?: { root: TParent; context: TContext; info: GraphQLResolveInfo }
    ) => TResult extends PromiseLike<infer TResultAwaited>
      ? Promise<Partial<TResultAwaited>>
      : Promise<Partial<TResult>> | Partial<TResult>;`;
  } else {
    return `(
      args?: TArgs,
      obj?: { root: TParent; context: TContext; info: GraphQLResolveInfo }
    ) => TResult extends PromiseLike<infer TResultAwaited>
      ? Promise<Partial<TResultAwaited>>
      : Promise<Partial<TResult>> | Partial<TResult>;`;
  }
};

exports.getResolverFnType = getResolverFnType;

function getCodegenOptions(documents, config, extraPlugins) {
  const plugins = [{
    typescript: {
      enumsAsTypes: true
    }
  }, ...extraPlugins.map(plugin => ({
    [plugin.name]: plugin.options
  }))];
  const pluginMap = {
    typescript: typescriptPlugin,
    ...extraPlugins.reduce((acc, cur) => ({ ...acc,
      [cur.name]: cur.codegenPlugin
    }), {})
  };
  const options = {
    // The typescript plugin returns a string instead of writing to a file, so
    // `filename` is not used
    filename: '',
    // `schemaAst` is used instead of `schema` if `schemaAst` is defined, and
    // `schema` isn't. In the source for GenerateOptions they have this
    // comment:
    //   Remove schemaAst and change schema to GraphQLSchema in the next major
    //   version
    // When that happens we'll have have to remove our `schema` line, and
    // rename `schemaAst` to `schema`
    schema: undefined,
    schemaAst: (0, _load.loadSchemaSync)((0, _paths.getPaths)().generated.schema, {
      loaders: [new _graphqlFileLoader.GraphQLFileLoader()],
      sort: true
    }),
    documents,
    config,
    plugins,
    pluginMap,
    pluginContext: {}
  };
  return options;
}