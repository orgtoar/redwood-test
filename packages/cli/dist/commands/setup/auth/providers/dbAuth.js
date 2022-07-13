"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.webPackages = exports.task = exports.notes = exports.config = exports.apiPackages = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _secureRandomPassword = _interopRequireDefault(require("secure-random-password"));

var _internal = require("@redwoodjs/internal");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

// the lines that need to be added to App.{js,tsx}
const config = {
  imports: [],
  authProvider: {
    type: 'dbAuth'
  }
}; // required packages to install

exports.config = config;
const webPackages = [];
exports.webPackages = webPackages;
const apiPackages = [];
exports.apiPackages = apiPackages;
const functionsPath = (0, _internal.getPaths)().api.functions.replace((0, _internal.getPaths)().base, '');
const libPath = (0, _internal.getPaths)().api.lib.replace((0, _internal.getPaths)().base, '');
const task = {
  title: 'Adding SESSION_SECRET...',
  task: () => {
    const envPath = _path.default.join((0, _internal.getPaths)().base, '.env');

    const secret = _secureRandomPassword.default.randomPassword({
      length: 64,
      characters: [_secureRandomPassword.default.lower, _secureRandomPassword.default.upper, _secureRandomPassword.default.digits]
    });

    const content = ['# Used to encrypt/decrypt session cookies. Change this value and re-deploy to log out all users of your app at once.', `SESSION_SECRET=${secret}`, ''];
    let envFile = '';

    if (_fs.default.existsSync(envPath)) {
      envFile = _fs.default.readFileSync(envPath).toString() + '\n';
    }

    _fs.default.writeFileSync(envPath, envFile + content.join('\n'));
  }
}; // any notes to print out when the job is done

exports.task = task;
const notes = [`${_colors.default.warning('Done! But you have a little more work to do:')}\n`, 'You will need to add a couple of fields to your User table in order', 'to store a hashed password and salt:', '', '  model User {', '    id                  Int @id @default(autoincrement())', '    email               String  @unique', '    hashedPassword      String    // <─┐', '    salt                String    // <─┼─ add these lines', '    resetToken          String?   // <─┤', '    resetTokenExpiresAt DateTime? // <─┘', '  }', '', 'If you already have existing user records you will need to provide', 'a default value for `hashedPassword` and `salt` or Prisma complains, so', 'change those to: ', '', '  hashedPassword String @default("")', '  salt           String @default("")', '', 'If you expose any of your user data via GraphQL be sure to exclude', '`hashedPassword` and `salt` (or whatever you named them) from the', 'SDL file that defines the fields for your user.', '', "You'll need to let Redwood know what fields you're using for your", "users' `id` and `username` fields. In this case we're using `id` and", '`email`, so update those in the `authFields` config in', `\`${functionsPath}/auth.js\` (this is also the place to tell Redwood if`, 'you used a different name for the `hashedPassword`, `salt`,', '`resetToken` or `resetTokenExpiresAt`, fields:`', '', '  authFields: {', "    id: 'id',", "    username: 'email',", "    hashedPassword: 'hashedPassword',", "    salt: 'salt',", "    resetToken: 'resetToken',", "    resetTokenExpiresAt: 'resetTokenExpiresAt',", '  },', '', "To get the actual user that's logged in, take a look at `getCurrentUser()`", `in \`${libPath}/auth.js\`. We default it to something simple, but you may`, 'use different names for your model or unique ID fields, in which case you', 'need to update those calls (instructions are in the comment above the code).', '', 'Finally, we created a SESSION_SECRET environment variable for you in', `${_path.default.join((0, _internal.getPaths)().base, '.env')}. This value should NOT be checked`, 'into version control and should be unique for each environment you', 'deploy to. If you ever need to log everyone out of your app at once', 'change this secret to a new value and deploy. To create a new secret, run:', '', '  yarn rw generate secret', '', "Need simple Login, Signup and Forgot Password pages? We've got a generator", 'for those as well:', '', '  yarn rw generate dbAuth'];
exports.notes = notes;