"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;
require("core-js/modules/es.array.push.js");
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));
var _path = _interopRequireDefault(require("path"));
var _camelCase = require("camel-case");
var _enquirer = _interopRequireDefault(require("enquirer"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _titleCase = require("title-case");
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _rollback = require("../../../lib/rollback");
var _helpers = require("../helpers");
const ROUTES = [`<Route path="/login" page={LoginPage} name="login" />`, `<Route path="/signup" page={SignupPage} name="signup" />`, `<Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />`, `<Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />`];
const POST_INSTALL = `   ${_colors.default.warning("Pages created! But you're not done yet:")}\n\n` + `   You'll need to tell your pages where to redirect after a user has logged in,\n` + `   signed up, or reset their password. Look in LoginPage, SignupPage,\n` + `   ForgotPasswordPage and ResetPasswordPage for these lines: \n\n` + `     if (isAuthenticated) {\n` + `       navigate(routes.home())\n` + `     }\n\n` + `   and change the route to where you want them to go if the user is already\n` + `   logged in. Also take a look in the onSubmit() functions in ForgotPasswordPage\n` + `   and ResetPasswordPage to change where the user redirects to after submitting\n` + `   those forms.\n\n` + `   Oh, and if you haven't already, add the necessary dbAuth functions and\n` + `   app setup by running:\n\n` + `     yarn rw setup auth dbAuth\n\n` + `   Happy authenticating!\n`;
const WEBAUTHN_POST_INSTALL = `   ${_colors.default.warning("Pages created! But you're not done yet:")}\n\n` + "   You'll need to tell your pages where to redirect after a user has logged in,\n" + '   signed up, or reset their password. In LoginPage, look for the `REDIRECT`\n' + `   constant and change the route if it's something other than home().\n` + `   In SignupPage, ForgotPasswordPage and ResetPasswordPage look for these lines:\n\n` + `     if (isAuthenticated) {\n` + `       navigate(routes.home())\n` + `     }\n\n` + `   and change the route to where you want them to go if the user is already\n` + `   logged in. Also take a look in the onSubmit() functions in ForgotPasswordPage\n` + `   and ResetPasswordPage to change where the user redirects to after submitting\n` + `   those forms.\n\n` + `   Oh, and if you haven't already, add the necessary dbAuth functions and\n` + `   app setup by running:\n\n` + `     yarn rw setup auth dbAuth\n\n` + `   Happy authenticating!\n`;
const command = exports.command = 'dbAuth';
const description = exports.description = 'Generate Login, Signup and Forgot Password pages for dbAuth';
const builder = yargs => {
  var _context;
  yargs.option('skip-forgot', {
    description: 'Skip generating the Forgot Password page',
    type: 'boolean',
    default: false
  }).option('skip-login', {
    description: 'Skip generating the login page',
    type: 'boolean',
    default: false
  }).option('skip-reset', {
    description: 'Skip generating the Reset Password page',
    type: 'boolean',
    default: false
  }).option('skip-signup', {
    description: 'Skip generating the signup page',
    type: 'boolean',
    default: false
  }).option('webauthn', {
    alias: 'w',
    default: null,
    description: 'Include WebAuthn support (TouchID/FaceID)',
    type: 'boolean'
  }).option('username-label', {
    default: null,
    description: 'Override default form label for username field',
    type: 'string'
  }).option('password-label', {
    default: null,
    description: 'Override default form label for password field',
    type: 'string'
  }).option('rollback', {
    description: 'Revert all generator actions if an error occurs',
    type: 'boolean',
    default: true
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/authentication#self-hosted-auth-installation-and-setup')}`);

  // Merge generator defaults in
  (0, _forEach.default)(_context = (0, _entries.default)(_helpers.yargsDefaults)).call(_context, ([option, config]) => {
    yargs.option(option, config);
  });
};
exports.builder = builder;
const files = async ({
  _tests,
  typescript,
  skipForgot,
  skipLogin,
  skipReset,
  skipSignup,
  webauthn,
  usernameLabel,
  passwordLabel
}) => {
  const files = [];
  usernameLabel = usernameLabel || 'username';
  passwordLabel = passwordLabel || 'password';
  const templateVars = {
    usernameLowerCase: usernameLabel.toLowerCase(),
    usernameCamelCase: (0, _camelCase.camelCase)(usernameLabel),
    usernameTitleCase: (0, _titleCase.titleCase)(usernameLabel),
    passwordLowerCase: passwordLabel.toLowerCase(),
    passwordCamelCase: (0, _camelCase.camelCase)(passwordLabel),
    passwordTitleCase: (0, _titleCase.titleCase)(passwordLabel)
  };
  if (!skipForgot) {
    files.push(await (0, _helpers.templateForComponentFile)({
      name: 'ForgotPassword',
      suffix: 'Page',
      extension: typescript ? '.tsx' : '.jsx',
      webPathSection: 'pages',
      generator: 'dbAuth',
      templatePath: 'forgotPassword.tsx.template',
      templateVars
    }));
  }
  if (!skipLogin) {
    files.push(await (0, _helpers.templateForComponentFile)({
      name: 'Login',
      suffix: 'Page',
      extension: typescript ? '.tsx' : '.jsx',
      webPathSection: 'pages',
      generator: 'dbAuth',
      templatePath: webauthn ? 'login.webAuthn.tsx.template' : 'login.tsx.template',
      templateVars
    }));
  }
  if (!skipReset) {
    files.push(await (0, _helpers.templateForComponentFile)({
      name: 'ResetPassword',
      suffix: 'Page',
      extension: typescript ? '.tsx' : '.jsx',
      webPathSection: 'pages',
      generator: 'dbAuth',
      templatePath: 'resetPassword.tsx.template',
      templateVars
    }));
  }
  if (!skipSignup) {
    files.push(await (0, _helpers.templateForComponentFile)({
      name: 'Signup',
      suffix: 'Page',
      extension: typescript ? '.tsx' : '.jsx',
      webPathSection: 'pages',
      generator: 'dbAuth',
      templatePath: 'signup.tsx.template',
      templateVars
    }));
  }
  if (files.length === 0) {
    console.info(_colors.default.error('\nNo files to generate.\n'));
    process.exit(0);
  }

  // add scaffold CSS file if it doesn't exist already
  const scaffoldOutputPath = _path.default.join((0, _lib.getPaths)().web.src, 'scaffold.css');
  if (!_fsExtra.default.existsSync(scaffoldOutputPath)) {
    const scaffoldTemplate = await (0, _lib.generateTemplate)(_path.default.join(__dirname, '../scaffold/templates/assets/scaffold.css.template'), {
      name: 'scaffold'
    });
    files.push([scaffoldOutputPath, scaffoldTemplate]);
  }
  return (0, _reduce.default)(files).call(files, async (accP, [outputPath, content]) => {
    const acc = await accP;
    let template = content;
    if (outputPath.match(/\.[jt]sx?/) && !typescript) {
      template = await (0, _lib.transformTSToJS)(outputPath, content);
    }
    return {
      [outputPath]: template,
      ...acc
    };
  }, _promise.default.resolve({}));
};
exports.files = files;
const tasks = ({
  enquirer,
  listr2,
  force,
  tests,
  typescript,
  skipForgot,
  skipLogin,
  skipReset,
  skipSignup,
  webauthn,
  usernameLabel,
  passwordLabel
}) => {
  return new _listr.Listr([{
    title: 'Determining UI labels...',
    skip: () => {
      return usernameLabel && passwordLabel;
    },
    task: async (ctx, task) => {
      return task.newListr([{
        title: 'Username label',
        task: async (subctx, subtask) => {
          if (usernameLabel) {
            subtask.skip(`Argument username-label is set, using: "${usernameLabel}"`);
            return;
          }
          usernameLabel = await subtask.prompt({
            type: 'input',
            name: 'username',
            message: 'What would you like the username label to be:',
            default: 'Username'
          });
          subtask.title = `Username label: "${usernameLabel}"`;
        }
      }, {
        title: 'Password label',
        task: async (subctx, subtask) => {
          if (passwordLabel) {
            subtask.skip(`Argument password-label passed, using: "${passwordLabel}"`);
            return;
          }
          passwordLabel = await subtask.prompt({
            type: 'input',
            name: 'password',
            message: 'What would you like the password label to be:',
            default: 'Password'
          });
          subtask.title = `Password label: "${passwordLabel}"`;
        }
      }]);
    }
  }, {
    title: 'Querying WebAuthn addition...',
    task: async (ctx, task) => {
      if (webauthn != null) {
        task.skip(`Querying WebAuthn addition: argument webauthn passed, WebAuthn ${webauthn ? '' : 'not'} included`);
        return;
      }
      const response = await task.prompt({
        type: 'confirm',
        name: 'answer',
        message: `Enable WebAuthn support (TouchID/FaceID) on LoginPage? See https://redwoodjs.com/docs/auth/dbAuth#webAuthn`,
        default: false
      });
      webauthn = response;
      task.title = `Querying WebAuthn addition: WebAuthn addition ${webauthn ? '' : 'not'} included`;
    }
  }, {
    title: 'Creating pages...',
    task: async () => {
      const filesObj = await files({
        tests,
        typescript,
        skipForgot,
        skipLogin,
        skipReset,
        skipSignup,
        webauthn,
        usernameLabel,
        passwordLabel
      });
      return (0, _lib.writeFilesTask)(filesObj, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Adding routes...',
    task: async () => {
      (0, _lib.addRoutesToRouterTask)(ROUTES);
    }
  }, {
    title: 'Adding scaffold import...',
    task: () => (0, _lib.addScaffoldImport)()
  }, {
    title: 'One more thing...',
    task: () => {
      // This doesn't preserve formatting, so it's been moved to regular
      // console.log()s after the tasks have all finished running
      // task.title = webauthn ? WEBAUTHN_POST_INSTALL : POST_INSTALL
    }
  }], {
    silentRendererCondition: () => listr2?.silentRendererCondition,
    rendererOptions: {
      collapseSubtasks: false
    },
    injectWrapper: {
      enquirer: enquirer || new _enquirer.default()
    },
    exitOnError: true
  });
};
const handler = async yargs => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'generate dbAuth',
    skipForgot: yargs.skipForgot,
    skipLogin: yargs.skipLogin,
    skipReset: yargs.skipReset,
    skipSignup: yargs.skipSignup,
    webauthn: yargs.webauthn,
    force: yargs.force,
    rollback: yargs.rollback
  });
  const t = tasks({
    ...yargs
  });
  try {
    if (yargs.rollback && !yargs.force) {
      (0, _rollback.prepareForRollback)(t);
    }
    await t.run();
    console.log('');
    console.log(yargs.webauthn ? WEBAUTHN_POST_INSTALL : POST_INSTALL);
  } catch (e) {
    console.log(_colors.default.error(e.message));
  }
};
exports.handler = handler;