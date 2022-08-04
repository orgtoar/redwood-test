"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateGraphQLSchema = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _core = require("@graphql-codegen/core");

var schemaAstPlugin = _interopRequireWildcard(require("@graphql-codegen/schema-ast"));

var _codeFileLoader = require("@graphql-tools/code-file-loader");

var _load = require("@graphql-tools/load");

var _chalk = _interopRequireDefault(require("chalk"));

var _graphql = require("graphql");

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _graphqlServer = require("@redwoodjs/graphql-server");

var _paths = require("../paths");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const generateGraphQLSchema = async () => {
  const schemaPointerMap = {
    [(0, _graphql.print)(_graphqlServer.rootSchema.schema)]: {},
    'graphql/**/*.sdl.{js,ts}': {},
    'directives/**/*.{js,ts}': {}
  };
  const loadSchemaConfig = {
    assumeValidSDL: true,
    sort: true,
    convertExtensions: true,
    includeSources: true,
    cwd: (0, _paths.getPaths)().api.src,
    schema: Object.keys(schemaPointerMap),
    generates: {
      [(0, _paths.getPaths)().generated.schema]: {
        plugins: ['schema-ast']
      }
    },
    silent: false,
    errorsOnly: false,
    pluginContext: {},
    loaders: [new _codeFileLoader.CodeFileLoader()]
  };
  let loadedSchema;

  try {
    loadedSchema = await (0, _load.loadSchema)(schemaPointerMap, loadSchemaConfig);
  } catch (e) {
    if (e instanceof Error) {
      const match = e.message.match(/Unknown type: "(\w+)"/);
      const name = match === null || match === void 0 ? void 0 : match[1];

      const schemaPrisma = _fs.default.readFileSync((0, _paths.getPaths)().api.dbSchema);

      console.error('');
      console.error('Schema loading failed.', e.message);
      console.error('');

      if (name && schemaPrisma.includes(`model ${name}`)) {
        // Not all SDLs need to be backed by a DB model, but if they are we can
        // provide a more helpful error message
        console.error([`  ${_chalk.default.bgYellow(` ${_chalk.default.black.bold('Heads up')} `)}`, '', _chalk.default.yellow(`  It looks like you have a ${name} model in your Prisma schema.`), _chalk.default.yellow(`  If it's part of a relation, you may have to generate SDL or scaffolding for ${name} too.`), _chalk.default.yellow(`  So, if you haven't done that yet, ignore this error message and run the SDL or scaffold generator for ${name} now.`), '', _chalk.default.yellow(`  See the ${(0, _terminalLink.default)('Troubleshooting Generators', 'https://redwoodjs.com/docs/schema-relations#troubleshooting-generators')} section in our docs for more help.`), ''].join('\n'));
      }
    }

    console.error(e); // Had to do this, or the full stacktrace wouldn't come through, and I
    // couldn't add a blank line after the stacktrace :( :shrug:

    console.error('\n\n\n\n\n\n');
  }

  const options = {
    config: {},
    // no extra config needed for merged schema file generation
    plugins: [{
      'schema-ast': {}
    }],
    pluginMap: {
      'schema-ast': schemaAstPlugin
    },
    schema: {},
    schemaAst: loadedSchema,
    filename: (0, _paths.getPaths)().generated.schema,
    documents: []
  };

  if (loadedSchema) {
    try {
      const schema = await (0, _core.codegen)(options);

      _fs.default.writeFileSync((0, _paths.getPaths)().generated.schema, schema);

      return (0, _paths.getPaths)().generated.schema;
    } catch (e) {
      console.error('GraphQL Schema codegen failed.');
      console.error(e);
    }
  }

  return '';
};

exports.generateGraphQLSchema = generateGraphQLSchema;