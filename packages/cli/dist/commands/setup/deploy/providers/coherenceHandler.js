"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = handler;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _replaceAll = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/replace-all"));
require("core-js/modules/es.array.push.js");
var _path = _interopRequireDefault(require("path"));
var _toml = _interopRequireDefault(require("@iarna/toml"));
var _internals = require("@prisma/internals");
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../../lib");
var _project = require("../../../../lib/project");
var _helpers = require("../helpers");
const redwoodProjectPaths = (0, _cliHelpers.getPaths)();
const EXTENSION = _cliHelpers.isTypeScriptProject ? 'ts' : 'js';
async function handler({
  force
}) {
  try {
    const addCoherenceFilesTask = await getAddCoherenceFilesTask(force);
    const tasks = new _listr.Listr([addCoherenceFilesTask, updateRedwoodTOMLTask(), (0, _lib.printSetupNotes)(["You're ready to deploy to Coherence! ✨\n", 'Go to https://app.withcoherence.com to create your account and setup your cloud or GitHub connections.', 'Check out the deployment docs at https://docs.withcoherence.com for detailed instructions and more information.\n', "Reach out to redwood@withcoherence.com with any questions! We're here to support you."])], {
      rendererOptions: {
        collapse: false
      }
    });
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_cliHelpers.colors.error(e.message));
    process.exit(e?.exitCode || 1);
  }
}

// ------------------------
// Tasks and helpers
// ------------------------

/**
 * Adds a health check file and a coherence.yml file by introspecting the prisma schema.
 */
async function getAddCoherenceFilesTask(force) {
  const files = [{
    path: _path.default.join(redwoodProjectPaths.api.functions, `health.${EXTENSION}`),
    content: coherenceFiles.healthCheck
  }];
  const coherenceConfigFile = {
    path: _path.default.join(redwoodProjectPaths.base, 'coherence.yml')
  };
  coherenceConfigFile.content = await getCoherenceConfigFileContent();
  files.push(coherenceConfigFile);
  return (0, _helpers.addFilesTask)({
    title: `Adding coherence.yml and health.${EXTENSION}`,
    files,
    force
  });
}

/**
 * Check the value of `provider` in the datasource block in `schema.prisma`:
 *
 * ```prisma title="schema.prisma"
 * datasource db {
 *   provider = "sqlite"
 *   url      = env("DATABASE_URL")
 * }
 * ```
 */
async function getCoherenceConfigFileContent() {
  const prismaSchema = await (0, _internals.getSchema)(redwoodProjectPaths.api.dbSchema);
  const prismaConfig = await (0, _internals.getConfig)({
    datamodel: prismaSchema
  });
  let db = prismaConfig.datasources[0].activeProvider;
  if (!(0, _includes.default)(SUPPORTED_DATABASES).call(SUPPORTED_DATABASES, db)) {
    throw new Error([`Coherence doesn't support the "${db}" provider in your Prisma schema.`, `To proceed, switch to one of the following: ${SUPPORTED_DATABASES.join(', ')}.`].join('\n'));
  }
  if (db === 'postgresql') {
    db = 'postgres';
  }
  const apiProdCommand = ['yarn', 'rw', 'build', 'api', '&&'];
  if ((0, _project.serverFileExists)()) {
    apiProdCommand.push('yarn', 'node', 'api/dist/server.js', '--apiRootPath=/api');
  } else {
    apiProdCommand.push('yarn', 'rw', 'serve', 'api', '--apiRootPath=/api');
  }
  return coherenceFiles.yamlTemplate({
    db,
    apiProdCommand: `[${(0, _map.default)(apiProdCommand).call(apiProdCommand, cmd => `"${cmd}"`).join(', ')}]`
  });
}
const SUPPORTED_DATABASES = ['mysql', 'postgresql'];

/**
 * should probably parse toml at this point...
 * if host, set host
 * Updates the ports in redwood.toml to use an environment variable.
 */
function updateRedwoodTOMLTask() {
  return {
    title: 'Updating redwood.toml...',
    task: () => {
      const redwoodTOMLPath = _path.default.join(redwoodProjectPaths.base, 'redwood.toml');
      let redwoodTOMLContent = _fsExtra.default.readFileSync(redwoodTOMLPath, 'utf-8');
      const redwoodTOMLObject = _toml.default.parse(redwoodTOMLContent);

      // Replace or add the host
      // How to handle matching one vs the other...
      if (!redwoodTOMLObject.web.host) {
        const [beforeWeb, afterWeb] = redwoodTOMLContent.split(/\[web\]\s/);
        redwoodTOMLContent = [beforeWeb, '[web]\n  host = "0.0.0.0"\n', afterWeb].join('');
      }
      if (!redwoodTOMLObject.api.host) {
        const [beforeApi, afterApi] = redwoodTOMLContent.split(/\[api\]\s/);
        redwoodTOMLContent = [beforeApi, '[api]\n  host = "0.0.0.0"\n', afterApi].join('');
      }
      redwoodTOMLContent = (0, _replaceAll.default)(redwoodTOMLContent).call(redwoodTOMLContent, HOST_REGEXP, (match, spaceBeforeAssign, spaceAfterAssign) => ['host', spaceBeforeAssign, '=', spaceAfterAssign, '"0.0.0.0"'].join(''));

      // Replace the apiUrl
      redwoodTOMLContent = redwoodTOMLContent.replace(API_URL_REGEXP, (match, spaceBeforeAssign, spaceAfterAssign) => ['apiUrl', spaceBeforeAssign, '=', spaceAfterAssign, '"/api"'].join(''));

      // Replace the web and api ports.
      redwoodTOMLContent = (0, _replaceAll.default)(redwoodTOMLContent).call(redwoodTOMLContent, PORT_REGEXP, (_match, spaceBeforeAssign, spaceAfterAssign, port) => ['port', spaceBeforeAssign, '=', spaceAfterAssign, `"\${PORT:${port}}"`].join(''));
      _fsExtra.default.writeFileSync(redwoodTOMLPath, redwoodTOMLContent);
    }
  };
}
const HOST_REGEXP = /host(\s*)=(\s*)\".+\"/g;
const API_URL_REGEXP = /apiUrl(\s*)=(\s*)\".+\"/;
const PORT_REGEXP = /port(\s*)=(\s*)(?<port>\d{4})/g;

// ------------------------
// Files
// ------------------------

const coherenceFiles = {
  yamlTemplate({
    db,
    apiProdCommand
  }) {
    return `\
api:
  type: backend
  url_path: "/api"
  prod:
    command: ${apiProdCommand}
  dev:
    command: ["yarn", "rw", "build", "api", "&&", "yarn", "rw", "dev", "api", "--apiRootPath=/api"]
  local_packages: ["node_modules"]

  system:
    cpu: 2
    memory: 2G
    health_check: "/api/health"

  resources:
    - name: ${_path.default.basename(redwoodProjectPaths.base)}-db
      engine: ${db}
      version: 13
      type: database
      ${db === 'postgres' ? 'adapter: postgresql' : ''}

  # If you use data migrations, use the following instead:
  # migration: ["yarn", "rw", "prisma", "migrate", "deploy", "&&", "yarn", "rw", "data-migrate", "up"]
  migration: ["yarn", "rw", "prisma", "migrate", "deploy"]

web:
  type: frontend
  assets_path: "web/dist"
  prod:
    command: ["yarn", "rw", "serve", "web"]
  dev:
    command: ["yarn", "rw", "dev", "web", "--fwd=\\"--allowed-hosts all\\""]

  # Heads up: Redwood's prerender doesn't work with Coherence yet.
  # For current status and updates, see https://github.com/redwoodjs/redwood/issues/8333.
  build: ["yarn", "rw", "build", "web", "--no-prerender"]
  local_packages: ["node_modules"]

  system:
    cpu: 2
    memory: 2G
`;
  },
  healthCheck: `\
// Coherence health check
export const handler = async () => {
  return {
    statusCode: 200,
  }
}
`
};