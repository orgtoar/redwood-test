"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.getCmdMajorVersion = exports.description = exports.command = exports.builder = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _execa = _interopRequireDefault(require("execa"));

var _latestVersion = _interopRequireDefault(require("latest-version"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../lib");

var _colors = _interopRequireDefault(require("../lib/colors"));

var _generatePrismaClient = require("../lib/generatePrismaClient");

const command = 'upgrade';
exports.command = command;
const description = 'Upgrade all @redwoodjs packages via interactive CLI';
exports.description = description;

const builder = yargs => {
  yargs.example('rw upgrade -t 0.20.1-canary.5', 'Specify a version. URL for Version History:\nhttps://www.npmjs.com/package/@redwoodjs/core').option('dry-run', {
    alias: 'd',
    description: 'Check for outdated packages without upgrading',
    type: 'boolean'
  }).option('tag', {
    alias: 't',
    description: '[choices: "canary", "rc", or specific-version (see example below)] WARNING: "canary" and "rc" tags are unstable releases!',
    requiresArg: true,
    type: 'string',
    coerce: validateTag
  }).option('verbose', {
    alias: 'v',
    description: 'Print verbose logs',
    type: 'boolean',
    default: false
  }).option('dedupe', {
    description: 'Skip dedupe check with --no-dedupe',
    type: 'boolean',
    default: true
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#upgrade')}`) // Just to make an empty line
  .epilogue('').epilogue(`We are < v1.0.0, so breaking changes occur frequently. For more information on the current release, see the ${(0, _terminalLink.default)('release page', 'https://github.com/redwoodjs/redwood/releases')}`);
}; // Used in yargs builder to coerce tag AND to parse yarn version


exports.builder = builder;
const SEMVER_REGEX = /(?<=^v?|\sv?)(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*)(?:\.(?:0|[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*))*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?(?=$|\s)/i;

const validateTag = tag => {
  const isTagValid = tag === 'rc' || tag === 'canary' || tag === 'latest' || SEMVER_REGEX.test(tag);

  if (!isTagValid) {
    // Stop execution
    throw new Error(_colors.default.error('Invalid tag supplied. Supported values: rc, canary, latest, or valid semver version\n'));
  }

  return tag;
};

const handler = async ({
  dryRun,
  tag,
  verbose,
  dedupe
}) => {
  // structuring as nested tasks to avoid bug with task.title causing duplicates
  const tasks = new _listr.default([{
    title: 'Checking latest version',
    task: async ctx => setLatestVersionToContext(ctx, tag)
  }, {
    title: 'Updating your project package.json(s)',
    task: ctx => updateRedwoodDepsForAllSides(ctx, {
      dryRun,
      verbose
    }),
    enabled: ctx => !!ctx.versionToUpgradeTo
  }, {
    title: 'Running yarn install',
    task: ctx => yarnInstall(ctx, {
      dryRun,
      verbose
    }),
    skip: () => dryRun
  }, {
    title: 'Refreshing the Prisma client',
    task: (_ctx, task) => refreshPrismaClient(task, {
      verbose
    }),
    skip: () => dryRun
  }, {
    title: 'De-duplicating dependencies',
    skip: () => dryRun || !dedupe,
    task: (_ctx, task) => dedupeDeps(task, {
      verbose
    })
  }, {
    title: 'One more thing..',
    task: (ctx, task) => {
      const version = ctx.versionToUpgradeTo;
      task.title = `One more thing...\n\n   ${_colors.default.warning(`🎉 Your project has been upgraded to RedwoodJS ${version}!`)} \n\n` + `   Please review the release notes for any manual steps: \n   ❖ ${(0, _terminalLink.default)(`Redwood community discussion`, `https://community.redwoodjs.com/search?q=${version}%23announcements`)}\n   ❖ ${(0, _terminalLink.default)(`GitHub Release notes`, `https://github.com/redwoodjs/redwood/releases` // intentionally not linking to specific version
      )}
          `;
    }
  }], {
    collapse: false,
    renderer: verbose && _listrVerboseRenderer.default
  });

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;

async function yarnInstall({
  verbose
}) {
  const yarnVersion = await getCmdMajorVersion('yarn');

  try {
    await (0, _execa.default)('yarn install', yarnVersion > 1 ? [] : ['--force', '--non-interactive'], {
      shell: true,
      stdio: verbose ? 'inherit' : 'pipe',
      cwd: (0, _lib.getPaths)().base
    });
  } catch (e) {
    throw new Error('Could not finish installation. Please run `yarn install --force`, before continuing');
  }
}

async function setLatestVersionToContext(ctx, tag) {
  try {
    const foundVersion = await (0, _latestVersion.default)('@redwoodjs/core', tag ? {
      version: tag
    } : {});
    ctx.versionToUpgradeTo = foundVersion;
    return foundVersion;
  } catch (e) {
    throw new Error('Could not find the latest version');
  }
}
/**
 * Iterates over Redwood dependencies in package.json files and updates the version.
 */


function updatePackageJsonVersion(pkgPath, version, {
  dryRun,
  verbose
}) {
  const pkg = JSON.parse(_fs.default.readFileSync(_path.default.join(pkgPath, 'package.json'), 'utf-8'));

  if (pkg.dependencies) {
    for (const depName of Object.keys(pkg.dependencies).filter(x => x.startsWith('@redwoodjs/'))) {
      if (verbose || dryRun) {
        console.log(` - ${depName}: ${pkg.dependencies[depName]} => ^${version}`);
      }

      pkg.dependencies[depName] = `^${version}`;
    }
  }

  if (pkg.devDependencies) {
    for (const depName of Object.keys(pkg.devDependencies).filter(x => x.startsWith('@redwoodjs/'))) {
      if (verbose || dryRun) {
        console.log(` - ${depName}: ${pkg.devDependencies[depName]} => ^${version}`);
      }

      pkg.devDependencies[depName] = `^${version}`;
    }
  }

  if (!dryRun) {
    _fs.default.writeFileSync(_path.default.join(pkgPath, 'package.json'), JSON.stringify(pkg, undefined, 2));
  }
}

function updateRedwoodDepsForAllSides(ctx, options) {
  if (!ctx.versionToUpgradeTo) {
    throw new Error('Failed to upgrade');
  }

  const updatePaths = [(0, _lib.getPaths)().base, (0, _lib.getPaths)().api.base, (0, _lib.getPaths)().web.base];
  return new _listr.default(updatePaths.map(basePath => {
    const pkgJsonPath = _path.default.join(basePath, 'package.json');

    return {
      title: `Updating ${pkgJsonPath}`,
      task: () => updatePackageJsonVersion(basePath, ctx.versionToUpgradeTo, options),
      skip: () => !_fs.default.existsSync(pkgJsonPath)
    };
  }));
}

async function refreshPrismaClient(task, {
  verbose
}) {
  /** Relates to prisma/client issue, @see: https://github.com/redwoodjs/redwood/issues/1083 */
  try {
    await (0, _generatePrismaClient.generatePrismaClient)({
      verbose,
      force: false,
      schema: (0, _lib.getPaths)().api.dbSchema
    });
  } catch (e) {
    task.skip('Refreshing the Prisma client caused an Error.');
    console.log('You may need to update your prisma client manually: $ yarn rw prisma generate');
    console.log(_colors.default.error(e.message));
  }
}

const getCmdMajorVersion = async command => {
  // Get current version
  const {
    stdout
  } = await (0, _execa.default)(command, ['--version'], {
    cwd: (0, _lib.getPaths)().base
  });

  if (!SEMVER_REGEX.test(stdout)) {
    throw new Error(`Unable to verify ${command} version.`);
  } // Get major version number


  const version = stdout.match(SEMVER_REGEX)[0];
  return parseInt(version.split('.')[0]);
};

exports.getCmdMajorVersion = getCmdMajorVersion;

const dedupeDeps = async (task, {
  verbose
}) => {
  try {
    const yarnVersion = await getCmdMajorVersion('yarn');
    const npxVersion = await getCmdMajorVersion('npx');
    let npxArgs = [];

    if (npxVersion > 6) {
      npxArgs = ['--yes'];
    }

    const baseExecaArgsForDedupe = {
      shell: true,
      stdio: verbose ? 'inherit' : 'pipe',
      cwd: (0, _lib.getPaths)().base
    };

    if (yarnVersion > 1) {
      await (0, _execa.default)('yarn', ['dedupe'], baseExecaArgsForDedupe);
    } else {
      await (0, _execa.default)('npx', [...npxArgs, 'yarn-deduplicate'], baseExecaArgsForDedupe);
    }
  } catch (e) {
    console.log(_colors.default.error(e.message));
    throw new Error('Could not finish de-duplication. For yarn 1.x, please run `npx yarn-deduplicate`, or for yarn 3 run `yarn dedupe` before continuing');
  }

  await yarnInstall({
    verbose
  });
};