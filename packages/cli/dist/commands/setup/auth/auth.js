"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.builder = builder;
exports.description = exports.command = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));
var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));
var _path = _interopRequireDefault(require("path"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../../../lib/");
const command = exports.command = 'auth <provider>';
const description = exports.description = 'Set up an auth configuration';
async function builder(yargs) {
  yargs.demandCommand().epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#setup-auth')}`)
  // Command "redirects" for auth providers we used to support
  .command(...redirectCommand('ethereum')).command(...redirectCommand('goTrue')).command(...redirectCommand('magicLink')).command(...redirectCommand('nhost')).command(...redirectCommand('okta'))
  // Auth providers we support
  .command('auth0', 'Set up auth for Auth0', yargs => (0, _cliHelpers.standardAuthBuilder)(yargs), async args => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: 'setup auth auth0',
      force: args.force,
      verbose: args.verbose
    });
    const handler = await getAuthHandler('@redwoodjs/auth-auth0-setup');
    console.log();
    handler(args);
  }).command(['azure-active-directory', 'azureActiveDirectory'], 'Set up auth for Azure Active Directory', yargs => (0, _cliHelpers.standardAuthBuilder)(yargs), async args => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: 'setup auth azure-active-directory',
      force: args.force,
      verbose: args.verbose
    });
    const handler = await getAuthHandler('@redwoodjs/auth-azure-active-directory-setup');
    console.log();
    handler(args);
  }).command('clerk', 'Set up auth for Clerk', yargs => (0, _cliHelpers.standardAuthBuilder)(yargs), async args => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: 'setup auth clerk',
      force: args.force,
      verbose: args.verbose
    });
    const handler = await getAuthHandler('@redwoodjs/auth-clerk-setup');
    console.log();
    handler(args);
  }).command('custom', 'Set up a custom auth provider', yargs => (0, _cliHelpers.standardAuthBuilder)(yargs), async args => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: 'setup auth custom',
      force: args.force,
      verbose: args.verbose
    });
    const handler = await getAuthHandler('@redwoodjs/auth-custom-setup');
    console.log();
    handler(args);
  }).command('dbAuth', 'Set up auth for dbAuth', yargs => {
    return (0, _cliHelpers.standardAuthBuilder)(yargs).option('webauthn', {
      alias: 'w',
      default: null,
      description: 'Include WebAuthn support (TouchID/FaceID)',
      type: 'boolean'
    });
  }, async args => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: 'setup auth dbAuth',
      force: args.force,
      verbose: args.verbose,
      webauthn: args.webauthn
    });
    const handler = await getAuthHandler('@redwoodjs/auth-dbauth-setup');
    console.log();
    handler(args);
  }).command('firebase', 'Set up auth for Firebase', yargs => (0, _cliHelpers.standardAuthBuilder)(yargs), async args => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: 'setup auth firebase',
      force: args.force,
      verbose: args.verbose
    });
    const handler = await getAuthHandler('@redwoodjs/auth-firebase-setup');
    console.log();
    handler(args);
  }).command('netlify', 'Set up auth for Netlify', yargs => (0, _cliHelpers.standardAuthBuilder)(yargs), async args => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: 'setup auth netlify',
      force: args.force,
      verbose: args.verbose
    });
    const handler = await getAuthHandler('@redwoodjs/auth-netlify-setup');
    console.log();
    handler(args);
  }).command('supabase', 'Set up auth for Supabase', yargs => (0, _cliHelpers.standardAuthBuilder)(yargs), async args => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: 'setup auth supabase',
      force: args.force,
      verbose: args.verbose
    });
    const handler = await getAuthHandler('@redwoodjs/auth-supabase-setup');
    console.log();
    handler(args);
  }).command('supertokens', 'Set up auth for SuperTokens', yargs => (0, _cliHelpers.standardAuthBuilder)(yargs), async args => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: 'setup auth supertokens',
      force: args.force,
      verbose: args.verbose
    });
    const handler = await getAuthHandler('@redwoodjs/auth-supertokens-setup');
    console.log();
    handler(args);
  });
}

/**
 * @param {string} provider
 * @returns {[string, boolean, () => void, () => void]}
 */
function redirectCommand(provider) {
  return [provider, false, () => {}, () => {
    (0, _cliHelpers.recordTelemetryAttributes)({
      command: `setup auth ${provider}`
    });
    console.log(getRedirectMessage(provider));
  }];
}

/**
 * Get a stock message for one of our removed auth providers
 * directing the user to the Custom Auth docs.
 *
 * @param {string} provider
 */
function getRedirectMessage(provider) {
  return `${provider} is no longer supported out of the box. But you can still integrate it yourself with ${(0, _terminalLink.default)('Custom Auth', 'https://redwoodjs.com/docs/canary/auth/custom')}`;
}

/**
 * @param {string} module
 */
async function getAuthHandler(module) {
  const packageJsonPath = require.resolve('@redwoodjs/cli/package.json');
  let {
    version
  } = _fsExtra.default.readJSONSync(packageJsonPath);
  if (!isInstalled(module)) {
    var _context;
    // If the version includes a plus, like '4.0.0-rc.428+dd79f1726'
    // (all @canary, @next, and @rc packages do), get rid of everything after the plus.
    if ((0, _includes.default)(version).call(version, '+')) {
      version = version.split('+')[0];
    }
    let packument;
    try {
      const packumentResponse = await fetch(`https://registry.npmjs.org/${module}`);
      packument = await packumentResponse.json();
      if (packument.error) {
        throw new Error(packument.error);
      }
    } catch (error) {
      throw new Error(`Couldn't fetch packument for ${module}: ${error.message}`);
    }
    const versionIsPublished = (0, _includes.default)(_context = (0, _keys.default)(packument.versions)).call(_context, version);
    if (!versionIsPublished) {
      // Fallback to canary. This is most likely because it's a new package
      version = 'canary';
    }

    // We use `version` to make sure we install the same version of the auth
    // setup package as the rest of the RW packages
    await _execa.default.command(`yarn add -D ${module}@${version}`, {
      stdio: 'inherit',
      cwd: (0, _lib.getPaths)().base
    });
  }
  const setupModule = await import(module);
  return setupModule.default.handler;
}

/**
 * Check if a user's project's package.json has a module listed as a dependency
 * or devDependency. If not, check node_modules.
 *
 * @param {string} module
 */
function isInstalled(module) {
  var _context2;
  const {
    dependencies,
    devDependencies
  } = _fsExtra.default.readJSONSync(_path.default.join((0, _lib.getPaths)().base, 'package.json'));
  const deps = {
    ...dependencies,
    ...devDependencies
  };
  if (deps[module]) {
    return true;
  }

  // Check any of the places require would look for this module.
  // This enables testing auth setup packages with `yarn rwfw project:copy`.
  //
  // We can't use require.resolve here because it caches the exception
  // Making it impossible to require when we actually do install it...
  return (0, _some.default)(_context2 = require.resolve.paths(`${module}/package.json`)).call(_context2, requireResolvePath => {
    return _fsExtra.default.existsSync(_path.default.join(requireResolvePath, module));
  });
}