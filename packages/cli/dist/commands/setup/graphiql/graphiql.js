"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.printHeaders = exports.handler = exports.getOutputPath = exports.generatePayload = exports.description = exports.command = exports.builder = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/interopRequireWildcard"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));

var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/date/now"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _uuid = require("uuid");

var _internal = require("@redwoodjs/internal");

var _structure = require("@redwoodjs/structure");

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

// tests if id, which is always a string from cli, is actually a number or uuid
const isNumeric = id => {
  return /^\d+$/.test((0, _parseInt2.default)(id));
};

const getExpiryTime = expiry => {
  return expiry ? (0, _now.default)() + expiry * 60 * 1000 : (0, _now.default)() + 3600 * 1000;
};

const getDBAuthHeader = userId => {
  if (!userId) {
    throw new Error('Require an unique id to generate session cookie');
  }

  if (!process.env.SESSION_SECRET) {
    throw new Error('dbAuth requires a SESSION_SECRET environment variable that is used to encrypt session cookies. Use `yarn rw g secret` to create one, then add to your `.env` file. DO NOT check this variable in your version control system!!');
  }

  const id = isNumeric(userId) ? (0, _parseInt2.default)(userId) : userId;

  const cookie = _cryptoJs.default.AES.encrypt((0, _stringify.default)({
    id
  }) + ';' + (0, _uuid.v4)(), process.env.SESSION_SECRET).toString();

  return {
    'auth-provider': 'dbAuth',
    cookie: `session=${cookie}`,
    authorization: `Bearer ${id}`
  };
};

const getSupabasePayload = (id, expiry) => {
  if (!process.env.SUPABASE_JWT_SECRET) {
    throw new Error('SUPABASE_JWT_SECRET env var is not set.');
  }

  const payload = {
    aud: 'authenticated',
    exp: getExpiryTime(expiry),
    sub: id ?? 'test-user-id',
    email: 'user@example.com',
    app_metadata: {
      provider: 'email'
    },
    user_metadata: {},
    role: 'authenticated',
    roles: []
  };
  return payload;
};

const getNetlifyPayload = (id, expiry) => {
  const payload = {
    exp: getExpiryTime(expiry),
    sub: id ?? 'test-user-id',
    email: 'user@example.com',
    app_metadata: {
      provider: 'email',
      authorization: {
        roles: []
      }
    },
    user_metadata: {}
  };
  return payload;
};

const supportedProviders = {
  dbAuth: {
    getPayload: getDBAuthHeader,
    env: ''
  },
  supabase: {
    getPayload: getSupabasePayload,
    env: 'process.env.SUPABASE_JWT_SECRET'
  },
  // no access to netlify JWT private key in dev.
  netlify: {
    getPayload: getNetlifyPayload,
    env: '"secret-123"'
  }
};

const generatePayload = (provider, id, token, expiry) => {
  if (token) {
    return {
      'auth-provider': provider,
      authorization: `Bearer ${token}`
    };
  }

  return supportedProviders[provider].getPayload(id, expiry);
};

exports.generatePayload = generatePayload;

const addHeaderOption = () => {
  const graphqlPath = (0, _lib.getGraphqlPath)();
  let content = (0, _lib.readFile)(graphqlPath).toString();
  const [_, hasHeaderImport] = content.match(/(import .* from 'src\/lib\/generateGraphiQLHeader.*')/s) || [];

  if (!hasHeaderImport) {
    // add header import statement
    content = content.replace(/^(.*services.*)$/m, `$1\n\nimport generateGraphiQLHeader from 'src/lib/generateGraphiQLHeader'`); // add object to handler

    content = content.replace(/^(\s*)(loggerConfig:)(.*)$/m, `$1generateGraphiQLHeader,\n$1$2$3`);

    _fs.default.writeFileSync(graphqlPath, content);
  }
};

const getOutputPath = () => {
  return _path.default.join((0, _lib.getPaths)().api.lib, (0, _structure.getProject)().isTypeScriptProject ? 'generateGraphiQLHeader.ts' : 'generateGraphiQLHeader.js');
};

exports.getOutputPath = getOutputPath;

const printHeaders = async () => {
  // Import babel settings so we can write es6 scripts
  (0, _internal.registerApiSideBabelHook)();
  const srcPath = getOutputPath();

  if (!(0, _lib.existsAnyExtensionSync)(srcPath) && `File doesn't exist`) {
    throw new Error('Must run yarn rw setup graphiql <provider> to generate headers before viewing');
  }

  const script = await _promise.default.resolve(`${srcPath}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
  await script.default();
};

exports.printHeaders = printHeaders;
const command = 'graphiql <provider>';
exports.command = command;
const description = 'Generate GraphiQL headers';
exports.description = description;

const builder = yargs => {
  yargs.positional('provider', {
    choices: (0, _keys.default)(supportedProviders),
    description: 'Auth provider used',
    type: 'string'
  }).option('id', {
    alias: 'i',
    description: 'Unique id to identify current user',
    type: 'string'
  }).option('token', {
    alias: 't',
    description: 'Generated JWT token. If not provided, mock JWT payload is provided that can be modified and turned into a token',
    type: 'string'
  }).option('expiry', {
    alias: 'e',
    default: 60,
    description: 'Token expiry in minutes. Default is 60',
    type: 'number'
  }).option('view', {
    alias: 'v',
    default: false,
    description: 'Print out generated headers',
    type: 'boolean'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup-header')}`);
};

exports.builder = builder;

const handler = async ({
  provider,
  id,
  token,
  expiry,
  view
}) => {
  var _context;

  let payload;
  const tasks = new _listr.default((0, _filter.default)(_context = [{
    title: 'Generating graphiql header...',
    task: () => {
      payload = generatePayload(provider, id, token, expiry);
    }
  }, {
    title: 'Generating file in src/lib/generateGraphiQLHeader.{js,ts}...',
    task: () => {
      const fileName = token || provider === 'dbAuth' ? 'graphiql-token.ts.template' : 'graphiql-mock.ts.template';
      const content = (0, _lib.generateTemplate)(_path.default.join(__dirname, 'templates', fileName), {
        name: 'graphiql',
        payload: (0, _stringify.default)(payload),
        env: supportedProviders[provider].env,
        provider,
        expireTime: expiry ? new Date((0, _now.default)() + expiry * 60 * 1000) : new Date((0, _now.default)() + 3600 * 1000)
      });
      const outputPath = getOutputPath();
      return (0, _lib.writeFilesTask)({
        [outputPath]: (0, _structure.getProject)().isTypeScriptProject ? content : (0, _lib.transformTSToJS)(outputPath, content)
      }, {
        overwriteExisting: true
      });
    }
  }, {
    title: 'Importing generated headers into createGraphQLHandler',
    task: (ctx, task) => {
      if ((0, _lib.graphFunctionDoesExist)()) {
        addHeaderOption();
      } else {
        task.skip('GraphQL function not found, skipping');
      }
    }
  }, {
    title: 'Installing packages...',
    task: async () => {
      if (!token && provider !== 'dbAuth') {
        await (0, _execa.default)('yarn', ['workspace', 'api', 'add', 'jsonwebtoken']);
      }
    }
  }]).call(_context, Boolean), {
    collapse: false
  });

  try {
    if (view) {
      return await printHeaders();
    }

    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;