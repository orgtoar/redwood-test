"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.getFlightcontrolJson = exports.description = exports.command = exports.builder = exports.alias = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _findIndex = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find-index"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/splice"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _fs = _interopRequireDefault(require("fs"));

var _os = require("os");

var _path = _interopRequireDefault(require("path"));

var _sdk = require("@prisma/sdk");

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../../lib");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

var _helpers = require("../helpers");

var _flightcontrol = require("../templates/flightcontrol");

// import terminalLink from 'terminal-link'
const command = 'flightcontrol';
exports.command = command;
const alias = 'fc';
exports.alias = alias;
const description = 'Setup Flightcontrol deploy';
exports.description = description;

const getFlightcontrolJson = async database => {
  if (database === 'none') {
    return {
      path: _path.default.join((0, _lib.getPaths)().base, 'flightcontrol.json'),
      content: _flightcontrol.flightcontrolConfig
    };
  }

  if (!_fs.default.existsSync(_path.default.join((0, _lib.getPaths)().base, 'api/db/schema.prisma'))) {
    throw new Error("Could not find prisma schema at 'api/db/schema.prisma'");
  }

  const schema = await (0, _sdk.getSchema)(_path.default.join((0, _lib.getPaths)().base, 'api/db/schema.prisma'));
  const config = await (0, _sdk.getConfig)({
    datamodel: schema
  });
  const detectedDatabase = config.datasources[0].activeProvider;

  if (detectedDatabase === database) {
    var _context;

    let dbService;

    switch (database) {
      case 'postgresql':
        dbService = _flightcontrol.postgresDatabaseService;
        break;

      case 'mysql':
        dbService = _flightcontrol.mysqlDatabaseService;
        break;

      default:
        throw new Error(`
       Unexpected datasource provider found: ${database}`);
    }

    return {
      path: _path.default.join((0, _lib.getPaths)().base, 'flightcontrol.json'),
      content: { ..._flightcontrol.flightcontrolConfig,
        environments: [{ ..._flightcontrol.flightcontrolConfig.environments[0],
          services: [...(0, _map.default)(_context = _flightcontrol.flightcontrolConfig.environments[0].services).call(_context, service => {
            if (service.id === 'redwood-api') {
              return { ...service,
                envVariables: { ...service.envVariables,
                  ..._flightcontrol.databaseEnvVariables
                }
              };
            }

            return service;
          }), dbService]
        }]
      }
    };
  } else {
    throw new Error(`
    Prisma datasource provider is detected to be ${detectedDatabase}.

    Update your schema.prisma provider to be postgresql or mysql, then run
    yarn rw prisma migrate dev
    yarn rw setup deploy flightcontrol
    `);
  }
};

exports.getFlightcontrolJson = getFlightcontrolJson;

const updateGraphQLFunction = () => {
  return {
    title: 'Adding CORS config to createGraphQLHandler...',
    task: _ctx => {
      const graphqlTsPath = _path.default.join((0, _lib.getPaths)().base, 'api/src/functions/graphql.ts');

      const graphqlJsPath = _path.default.join((0, _lib.getPaths)().base, 'api/src/functions/graphql.js');

      let graphqlFunctionsPath;

      if (_fs.default.existsSync(graphqlTsPath)) {
        graphqlFunctionsPath = graphqlTsPath;
      } else if (_fs.default.existsSync(graphqlJsPath)) {
        graphqlFunctionsPath = graphqlJsPath;
      } else {
        console.log(`
    Couldn't find graphql handler in api/src/functions/graphql.js.
    You'll have to add the following cors config manually:

      cors: { origin: process.env.REDWOOD_WEB_URL, credentials: true}
    `);
        return;
      }

      const graphqlContent = _fs.default.readFileSync(graphqlFunctionsPath, 'utf8').split(_os.EOL);

      const graphqlHanderIndex = (0, _findIndex.default)(graphqlContent).call(graphqlContent, line => (0, _includes.default)(line).call(line, 'createGraphQLHandler({'));

      if (graphqlHanderIndex === -1) {
        console.log(`
    Couldn't find graphql handler in api/src/functions/graphql.js.
    You'll have to add the following cors config manually:

      cors: { origin: process.env.REDWOOD_WEB_URL, credentials: true}
    `);
        return;
      }

      (0, _splice.default)(graphqlContent).call(graphqlContent, graphqlHanderIndex + 1, 0, '  cors: { origin: process.env.REDWOOD_WEB_URL, credentials: true },');

      _fs.default.writeFileSync(graphqlFunctionsPath, graphqlContent.join(_os.EOL));
    }
  };
};

const updateDbAuth = () => {
  return {
    title: 'Updating dbAuth cookie config (if used)...',
    task: _ctx => {
      const authTsPath = _path.default.join((0, _lib.getPaths)().base, 'api/src/functions/auth.ts');

      const authJsPath = _path.default.join((0, _lib.getPaths)().base, 'api/src/functions/auth.js');

      let authFnPath;

      if (_fs.default.existsSync(authTsPath)) {
        authFnPath = authTsPath;
      } else if (_fs.default.existsSync(authJsPath)) {
        authFnPath = authJsPath;
      } else {
        console.log(`Skipping, did not detect api/src/functions/auth.js`);
        return;
      }

      const authContent = _fs.default.readFileSync(authFnPath, 'utf8').split(_os.EOL);

      const sameSiteLineIndex = (0, _findIndex.default)(authContent).call(authContent, line => line.match(/SameSite:.*,/));

      if (sameSiteLineIndex === -1) {
        console.log(`
    Couldn't find cookie SameSite config in api/src/functions/auth.js.

    You need to ensure SameSite is set to "None"
    `);
        return;
      }

      authContent[sameSiteLineIndex] = `      SameSite: 'None',`;
      const dbHandlerIndex = (0, _findIndex.default)(authContent).call(authContent, line => (0, _includes.default)(line).call(line, 'new DbAuthHandler('));

      if (dbHandlerIndex === -1) {
        console.log(`
    Couldn't find DbAuthHandler in api/src/functions/auth.js.
    You'll have to add the following cors config manually:

      cors: { origin: process.env.REDWOOD_WEB_URL, credentials: true}
    `);
        return;
      }

      (0, _splice.default)(authContent).call(authContent, dbHandlerIndex + 1, 0, '  cors: { origin: process.env.REDWOOD_WEB_URL, credentials: true },');

      _fs.default.writeFileSync(authFnPath, authContent.join(_os.EOL));
    }
  };
};

const updateApp = () => {
  return {
    title: 'Updating App.js fetch config...',
    task: _ctx => {
      // TODO Can improve in the future with RW getPaths()
      const appTsPath = _path.default.join((0, _lib.getPaths)().base, 'web/src/App.tsx');

      const appJsPath = _path.default.join((0, _lib.getPaths)().base, 'web/src/App.js');

      let appPath;

      if (_fs.default.existsSync(appTsPath)) {
        appPath = appTsPath;
      } else if (_fs.default.existsSync(appJsPath)) {
        appPath = appJsPath;
      } else {
        // TODO this should never happen. Throw instead?
        console.log(`Skipping, did not detect web/src/App.js|tsx`);
        return;
      }

      const appContent = _fs.default.readFileSync(appPath, 'utf8').split(_os.EOL);

      const authLineIndex = (0, _findIndex.default)(appContent).call(appContent, line => (0, _includes.default)(line).call(line, '<AuthProvider'));

      if (authLineIndex === -1) {
        console.log(`
    Couldn't find <AuthProvider /> in web/src/App.js
    If (and when) you use *dbAuth*, you'll have to add the following fetch config to <AuthProvider />:

    config={{ fetchConfig: { credentials: 'include' } }}
    `); // This is CORS config for cookies, which is currently only dbAuth Currently only dbAuth uses cookies and would require this config
      } else if (appContent.toString().match(/dbAuth/)) {
        appContent[authLineIndex] = `      <AuthProvider type="dbAuth" config={{ fetchConfig: { credentials: 'include' } }}>
`;
      }

      const gqlLineIndex = (0, _findIndex.default)(appContent).call(appContent, line => (0, _includes.default)(line).call(line, '<RedwoodApolloProvider'));

      if (gqlLineIndex === -1) {
        console.log(`
    Couldn't find <RedwoodApolloProvider in web/src/App.js
    If (and when) you use *dbAuth*, you'll have to add the following fetch config manually:

    graphQLClientConfig={{ httpLinkConfig: { credentials: 'include' }}}
    `); // This is CORS config for cookies, which is currently only dbAuth Currently only dbAuth uses cookies and would require this config
      } else if (appContent.toString().match(/dbAuth/)) {
        appContent[gqlLineIndex] = `        <RedwoodApolloProvider graphQLClientConfig={{ httpLinkConfig: { credentials: 'include' }}} >
`;
      }

      _fs.default.writeFileSync(appPath, appContent.join(_os.EOL));
    }
  };
}; // We need to set the apiUrl evn var for local dev


const addToDotEnvDefaultTask = () => {
  return {
    title: 'Updating .env.defaults...',
    skip: () => {
      if (!_fs.default.existsSync(_path.default.resolve((0, _lib.getPaths)().base, '.env.defaults'))) {
        return `
        WARNING: could not update .env.defaults

        You'll have to add the following env var manually:

        REDWOOD_API_URL=/.redwood/functions
        `;
      }
    },
    task: async _ctx => {
      const env = _path.default.resolve((0, _lib.getPaths)().base, '.env.defaults');

      const line = '\n\nREDWOOD_API_URL=/.redwood/functions\n';

      _fs.default.appendFileSync(env, line);
    }
  };
};

const builder = yargs => yargs.option('database', {
  alias: 'd',
  choices: ['none', 'postgresql', 'mysql'],
  description: 'Database deployment for Flightcontrol only',
  default: 'postgresql',
  type: 'string'
}); // any notes to print out when the job is done


exports.builder = builder;
const notes = ['You are ready to deploy to Flightcontrol!\n', '👉 Create your project at https://app.flightcontrol.dev/signup?ref=redwood\n', 'Check out the deployment docs at https://app.flightcontrol.dev/docs for detailed instructions\n', "NOTE: If you are using yarn v1, remove the installCommand's from flightcontrol.json"];

const handler = async ({
  force,
  database
}) => {
  const tasks = new _listr.default([{
    title: 'Adding flightcontrol.json',
    task: async () => {
      const fileData = await getFlightcontrolJson(database);
      let files = {};
      files[fileData.path] = (0, _stringify.default)(fileData.content, null, 2);
      return (0, _lib.writeFilesTask)(files, {
        overwriteExisting: force
      });
    }
  }, updateGraphQLFunction(), updateDbAuth(), updateApp(), (0, _helpers.updateApiURLTask)('${REDWOOD_API_URL}'), addToDotEnvDefaultTask(), (0, _helpers.printSetupNotes)(notes)]);

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;