"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _generate = require("../../generate");

var _helpers = require("../helpers");

const ROUTES = [`<Route path="/login" page={LoginPage} name="login" />`, `<Route path="/signup" page={SignupPage} name="signup" />`, `<Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />`, `<Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />`];
const command = 'dbAuth';
exports.command = command;
const description = 'Generate Login, Signup and Forgot Password pages for dbAuth';
exports.description = description;

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
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/authentication#self-hosted-auth-installation-and-setup')}`); // Merge generator defaults in

  (0, _forEach.default)(_context = (0, _entries.default)(_generate.yargsDefaults)).call(_context, ([option, config]) => {
    yargs.option(option, config);
  });
};

exports.builder = builder;

const files = ({
  _tests,
  typescript,
  skipForgot,
  skipLogin,
  skipReset,
  skipSignup
}) => {
  const files = [];

  if (!skipForgot) {
    files.push((0, _helpers.templateForComponentFile)({
      name: 'ForgotPassword',
      suffix: 'Page',
      extension: typescript ? '.tsx' : '.js',
      webPathSection: 'pages',
      generator: 'dbAuth',
      templatePath: 'forgotPassword.tsx.template'
    }));
  }

  if (!skipLogin) {
    files.push((0, _helpers.templateForComponentFile)({
      name: 'Login',
      suffix: 'Page',
      extension: typescript ? '.tsx' : '.js',
      webPathSection: 'pages',
      generator: 'dbAuth',
      templatePath: 'login.tsx.template'
    }));
  }

  if (!skipReset) {
    files.push((0, _helpers.templateForComponentFile)({
      name: 'ResetPassword',
      suffix: 'Page',
      extension: typescript ? '.tsx' : '.js',
      webPathSection: 'pages',
      generator: 'dbAuth',
      templatePath: 'resetPassword.tsx.template'
    }));
  }

  if (!skipSignup) {
    files.push((0, _helpers.templateForComponentFile)({
      name: 'Signup',
      suffix: 'Page',
      extension: typescript ? '.tsx' : '.js',
      webPathSection: 'pages',
      generator: 'dbAuth',
      templatePath: 'signup.tsx.template'
    }));
  }

  if (files.length === 0) {
    console.info(_colors.default.error('\nNo files to generate.\n'));
    process.exit(0);
  } // add scaffold CSS file if it doesn't exist already


  const scaffoldOutputPath = _path.default.join((0, _lib.getPaths)().web.src, 'scaffold.css');

  if (!_fs.default.existsSync(scaffoldOutputPath)) {
    const scaffoldTemplate = (0, _lib.generateTemplate)(_path.default.join(__dirname, '../scaffold/templates/assets/scaffold.css.template'), {
      name: 'scaffold'
    });
    files.push([scaffoldOutputPath, scaffoldTemplate]);
  }

  return (0, _reduce.default)(files).call(files, (acc, [outputPath, content]) => {
    let template = content;

    if (outputPath.match(/\.[jt]sx?/) && !typescript) {
      template = (0, _lib.transformTSToJS)(outputPath, content);
    }

    return {
      [outputPath]: template,
      ...acc
    };
  }, {});
};

exports.files = files;

const tasks = ({
  force,
  tests,
  typescript,
  skipForgot,
  skipLogin,
  skipReset,
  skipSignup
}) => {
  return new _listr.default([{
    title: 'Creating pages...',
    task: async () => {
      return (0, _lib.writeFilesTask)(files({
        tests,
        typescript,
        skipForgot,
        skipLogin,
        skipReset,
        skipSignup
      }), {
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
    task: (ctx, task) => {
      task.title = `One more thing...\n\n` + `   ${_colors.default.warning("Pages created! But you're not done yet:")}\n\n` + `   You'll need to tell your pages where to redirect after a user has logged in,\n` + `   signed up, or reset their password. Look in LoginPage, SignupPage,\n` + `   ForgotPasswordPage and ResetPasswordPage for these lines: \n\n` + `     if (isAuthenticated) {\n` + `       navigate(routes.home())\n` + `     }\n\n` + `   and change the route to where you want them to go if the user is already\n` + `   logged in. Also take a look in the onSubmit() functions in ForgotPasswordPage\n` + `   and ResetPasswordPage to change where the user redirects to after submitting\n` + `   those forms.\n\n` + `   Oh, and if you haven't already, add the necessary dbAuth functions and\n` + `   app setup by running:\n\n` + `     yarn rw setup auth dbAuth\n\n` + `   Happy authenticating!\n`;
    }
  }], {
    collapse: false,
    exitOnError: true
  });
};

const handler = async options => {
  const t = tasks(options);

  try {
    await t.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
  }
};

exports.handler = handler;