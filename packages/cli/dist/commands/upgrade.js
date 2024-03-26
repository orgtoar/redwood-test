"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.validateTag = exports.handler = exports.getCmdMajorVersion = exports.description = exports.command = exports.builder = void 0;
require("core-js/modules/es.array.push.js");
require("core-js/modules/esnext.json.parse.js");
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _trimEnd = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim-end"));
var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));
var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/parse-int"));
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _latestVersion = _interopRequireDefault(require("latest-version"));
var _listr = require("listr2");
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _projectConfig = require("@redwoodjs/project-config");
var _lib = require("../lib");
var _colors = _interopRequireDefault(require("../lib/colors"));
var _generatePrismaClient = require("../lib/generatePrismaClient");
const command = exports.command = 'upgrade';
const description = exports.description = 'Upgrade all @redwoodjs packages via interactive CLI';
const builder = yargs => {
  yargs.example('rw upgrade -t 0.20.1-canary.5', 'Specify a version. URL for Version History:\nhttps://www.npmjs.com/package/@redwoodjs/core').option('dry-run', {
    alias: 'd',
    description: 'Check for outdated packages without upgrading',
    type: 'boolean'
  }).option('tag', {
    alias: 't',
    description: '[choices: "latest", "rc", "next", "canary", "experimental", or a specific-version (see example below)] WARNING: "canary", "rc" and "experimental" are unstable releases! And "canary" releases include breaking changes often requiring codemods if upgrading a project.',
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
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference for the upgrade command', 'https://redwoodjs.com/docs/cli-commands#upgrade')}.\nAnd the ${(0, _terminalLink.default)('GitHub releases page', 'https://github.com/redwoodjs/redwood/releases')} for more information on the current release.`);
};

// Used in yargs builder to coerce tag AND to parse yarn version
exports.builder = builder;
const SEMVER_REGEX = /(?<=^v?|\sv?)(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*)(?:\.(?:0|[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*))*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?(?=$|\s)/i;
const isValidSemver = string => {
  return SEMVER_REGEX.test(string);
};
const isValidRedwoodJSTag = tag => {
  var _context;
  return (0, _includes.default)(_context = ['rc', 'canary', 'latest', 'next', 'experimental']).call(_context, tag);
};
const validateTag = tag => {
  const isTagValid = isValidSemver(tag) || isValidRedwoodJSTag(tag);
  if (!isTagValid) {
    // Stop execution
    throw new Error(_colors.default.error("Invalid tag supplied. Supported values: 'rc', 'canary', 'latest', 'next', 'experimental', or a valid semver version\n"));
  }
  return tag;
};
exports.validateTag = validateTag;
const handler = async ({
  dryRun,
  tag,
  verbose,
  dedupe
}) => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'upgrade',
    dryRun,
    tag,
    verbose,
    dedupe
  });

  // structuring as nested tasks to avoid bug with task.title causing duplicates
  const tasks = new _listr.Listr([{
    title: 'Checking latest version',
    task: async ctx => setLatestVersionToContext(ctx, tag)
  }, {
    title: 'Updating your Redwood version',
    task: ctx => updateRedwoodDepsForAllSides(ctx, {
      dryRun,
      verbose
    }),
    enabled: ctx => !!ctx.versionToUpgradeTo
  }, {
    title: 'Updating other packages in your package.json(s)',
    task: ctx => updatePackageVersionsFromTemplate(ctx, {
      dryRun,
      verbose
    }),
    enabled: ctx => ctx.versionToUpgradeTo?.includes('canary')
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
      var _context2, _context4;
      const version = ctx.versionToUpgradeTo;
      const messageSections = [`One more thing...\n\n   ${_colors.default.warning(`🎉 Your project has been upgraded to RedwoodJS ${version}!`)} \n\n`];
      // Show links when switching to 'latest' or 'rc', undefined is essentially an alias of 'latest'
      if ((0, _includes.default)(_context2 = [undefined, 'latest', 'rc']).call(_context2, tag)) {
        messageSections.push(`   Please review the release notes for any manual steps: \n   ❖ ${(0, _terminalLink.default)(`Redwood community discussion`, `https://community.redwoodjs.com/search?q=${version}%23announcements`)}\n   ❖ ${(0, _terminalLink.default)(`GitHub Release notes`, `https://github.com/redwoodjs/redwood/releases` // intentionally not linking to specific version
        )} \n\n`);
      }
      // @MARK
      // This should be temporary and eventually superseded by a more generic notification system
      if (tag) {
        var _context3;
        const additionalMessages = [];
        // Reminder to update the `notifications.versionUpdates` TOML option
        if (!(0, _includes.default)(_context3 = (0, _projectConfig.getConfig)().notifications.versionUpdates).call(_context3, tag) && isValidRedwoodJSTag(tag)) {
          additionalMessages.push(`   ❖ You may want to update your redwood.toml config so that \`notifications.versionUpdates\` includes "${tag}"\n`);
        }
        // Append additional messages with a header
        if (additionalMessages.length > 0) {
          messageSections.push(`   📢 ${_colors.default.warning(`We'd also like to remind you that:`)} \n`, ...additionalMessages);
        }
      }
      task.title = (0, _trimEnd.default)(_context4 = messageSections.join('')).call(_context4);
    }
  }], {
    renderer: verbose && 'verbose',
    rendererOptions: {
      collapseSubtasks: false
    }
  });
  await tasks.run();
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
    throw new Error('Could not finish installation. Please run `yarn install` and then `yarn dedupe`, before continuing');
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
  const pkg = JSON.parse(_fsExtra.default.readFileSync(_path.default.join(pkgPath, 'package.json'), 'utf-8'));
  if (pkg.dependencies) {
    for (const depName of (0, _filter.default)(_context5 = (0, _keys.default)(pkg.dependencies)).call(_context5, x => (0, _startsWith.default)(x).call(x, '@redwoodjs/') && x !== '@redwoodjs/studio')) {
      var _context5;
      if (verbose || dryRun) {
        console.log(` - ${depName}: ${pkg.dependencies[depName]} => ${version}`);
      }
      pkg.dependencies[depName] = `${version}`;
    }
  }
  if (pkg.devDependencies) {
    for (const depName of (0, _filter.default)(_context6 = (0, _keys.default)(pkg.devDependencies)).call(_context6, x => (0, _startsWith.default)(x).call(x, '@redwoodjs/') && x !== '@redwoodjs/studio')) {
      var _context6;
      if (verbose || dryRun) {
        console.log(` - ${depName}: ${pkg.devDependencies[depName]} => ${version}`);
      }
      pkg.devDependencies[depName] = `${version}`;
    }
  }
  if (!dryRun) {
    _fsExtra.default.writeFileSync(_path.default.join(pkgPath, 'package.json'), (0, _stringify.default)(pkg, undefined, 2));
  }
}
function updateRedwoodDepsForAllSides(ctx, options) {
  if (!ctx.versionToUpgradeTo) {
    throw new Error('Failed to upgrade');
  }
  const updatePaths = [(0, _lib.getPaths)().base, (0, _lib.getPaths)().api.base, (0, _lib.getPaths)().web.base];
  return new _listr.Listr((0, _map.default)(updatePaths).call(updatePaths, basePath => {
    const pkgJsonPath = _path.default.join(basePath, 'package.json');
    return {
      title: `Updating ${pkgJsonPath}`,
      task: () => updatePackageJsonVersion(basePath, ctx.versionToUpgradeTo, options),
      skip: () => !_fsExtra.default.existsSync(pkgJsonPath)
    };
  }));
}
async function updatePackageVersionsFromTemplate(ctx, {
  dryRun,
  verbose
}) {
  if (!ctx.versionToUpgradeTo) {
    throw new Error('Failed to upgrade');
  }
  const packageJsons = [{
    basePath: (0, _lib.getPaths)().base,
    url: 'https://raw.githubusercontent.com/redwoodjs/redwood/main/packages/create-redwood-app/templates/ts/package.json'
  }, {
    basePath: (0, _lib.getPaths)().api.base,
    url: 'https://raw.githubusercontent.com/redwoodjs/redwood/main/packages/create-redwood-app/templates/ts/api/package.json'
  }, {
    basePath: (0, _lib.getPaths)().web.base,
    url: 'https://raw.githubusercontent.com/redwoodjs/redwood/main/packages/create-redwood-app/templates/ts/web/package.json'
  }];
  return new _listr.Listr((0, _map.default)(packageJsons).call(packageJsons, ({
    basePath,
    url
  }) => {
    const pkgJsonPath = _path.default.join(basePath, 'package.json');
    return {
      title: `Updating ${pkgJsonPath}`,
      task: async () => {
        var _context7, _context8;
        const res = await fetch(url);
        const text = await res.text();
        const templatePackageJson = JSON.parse(text);
        const localPackageJsonText = _fsExtra.default.readFileSync(pkgJsonPath, 'utf-8');
        const localPackageJson = JSON.parse(localPackageJsonText);
        (0, _forEach.default)(_context7 = (0, _entries.default)(templatePackageJson.dependencies || {})).call(_context7, ([depName, depVersion]) => {
          // Redwood packages are handled in another task
          if (!(0, _startsWith.default)(depName).call(depName, '@redwoodjs/')) {
            if (verbose || dryRun) {
              console.log(` - ${depName}: ${localPackageJson.dependencies[depName]} => ${depVersion}`);
            }
            localPackageJson.dependencies[depName] = depVersion;
          }
        });
        (0, _forEach.default)(_context8 = (0, _entries.default)(templatePackageJson.devDependencies || {})).call(_context8, ([depName, depVersion]) => {
          // Redwood packages are handled in another task
          if (!(0, _startsWith.default)(depName).call(depName, '@redwoodjs/')) {
            if (verbose || dryRun) {
              console.log(` - ${depName}: ${localPackageJson.devDependencies[depName]} => ${depVersion}`);
            }
            localPackageJson.devDependencies[depName] = depVersion;
          }
        });
        if (!dryRun) {
          _fsExtra.default.writeFileSync(pkgJsonPath, (0, _stringify.default)(localPackageJson, null, 2));
        }
      },
      skip: () => !_fsExtra.default.existsSync(pkgJsonPath)
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
  }

  // Get major version number
  const version = stdout.match(SEMVER_REGEX)[0];
  return (0, _parseInt2.default)(version.split('.')[0]);
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