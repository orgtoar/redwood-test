"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.notes = exports.config = exports.apiPackages = void 0;

_Object$defineProperty(exports, "task", {
  enumerable: true,
  get: function () {
    return _dbAuth.task;
  }
});

exports.webPackages = void 0;

var _path = _interopRequireDefault(require("path"));

var _paths = require("@redwoodjs/internal/dist/paths");

var _colors = _interopRequireDefault(require("../../../../lib/colors"));

var _dbAuth = require("./dbAuth");

// copy some identical values from dbAuth provider
// the lines that need to be added to App.{js,tsx}
const config = {
  imports: [`import WebAuthnClient from '@redwoodjs/auth/webAuthn'`],
  authProvider: {
    type: 'dbAuth',
    client: 'WebAuthnClient'
  }
}; // required packages to install

exports.config = config;
const webPackages = ['@simplewebauthn/browser'];
exports.webPackages = webPackages;
const apiPackages = ['@simplewebauthn/server']; // any notes to print out when the job is done

exports.apiPackages = apiPackages;
const notes = [`${_colors.default.warning('Done! But you have a little more work to do:')}\n`, 'You will need to add a couple of fields to your User table in order', 'to store a hashed password, salt, reset token, and to connect it to', 'a new UserCredential model to keep track of any devices used with', 'WebAuthn authentication:', '', '  model User {', '    id                  Int @id @default(autoincrement())', '    email               String  @unique', '    hashedPassword      String', '    salt                String', '    resetToken          String?', '    resetTokenExpiresAt DateTime?', '    webAuthnChallenge   String? @unique', '    credentials         UserCredential[]', '  }', '', '  model UserCredential {', '    id         String  @id', '    userId     Int', '    user       User    @relation(fields: [userId], references: [id])', '    publicKey  Bytes', '    transports String?', '    counter    BigInt', '  }', '', 'If you already have existing user records you will need to provide', 'a default value for `hashedPassword` and `salt` or Prisma complains, so', 'change those to: ', '', '  hashedPassword String @default("")', '  salt           String @default("")', '', 'If you expose any of your user data via GraphQL be sure to exclude', '`hashedPassword` and `salt` (or whatever you named them) from the', 'SDL file that defines the fields for your user.', '', "You'll need to let Redwood know what fields you're using for your", "users' `id` and `username` fields. In this case we're using `id` and", '`email`, so update those in the `authFields` config in', `\`${_dbAuth.functionsPath}/auth.js\` (this is also the place to tell Redwood if`, 'you used a different name for the `hashedPassword`, `salt`,', '`resetToken` or `resetTokenExpiresAt`, fields:`', '', '  authFields: {', "    id: 'id',", "    username: 'email',", "    hashedPassword: 'hashedPassword',", "    salt: 'salt',", "    resetToken: 'resetToken',", "    resetTokenExpiresAt: 'resetTokenExpiresAt',", "    challenge: 'webAuthnChallenge'", '  },', '', "To get the actual user that's logged in, take a look at `getCurrentUser()`", `in \`${_dbAuth.libPath}/auth.js\`. We default it to something simple, but you may`, 'use different names for your model or unique ID fields, in which case you', 'need to update those calls (instructions are in the comment above the code).', '', 'Finally, we created a SESSION_SECRET environment variable for you in', `${_path.default.join((0, _paths.getPaths)().base, '.env')}. This value should NOT be checked`, 'into version control and should be unique for each environment you', 'deploy to. If you ever need to log everyone out of your app at once', 'change this secret to a new value and deploy. To create a new secret, run:', '', '  yarn rw generate secret', '', 'Need simple Login, Signup, Forgot Password pages and WebAuthn prompts?', "We've got a generator for those as well:", '', '  yarn rw generate dbAuth'];
exports.notes = notes;