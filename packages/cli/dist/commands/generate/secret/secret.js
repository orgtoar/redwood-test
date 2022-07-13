"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.generateSecret = exports.description = exports.command = exports.builder = void 0;

var _secureRandomPassword = _interopRequireDefault(require("secure-random-password"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

const DEFAULT_LENGTH = 64;

const generateSecret = (length = DEFAULT_LENGTH) => {
  return _secureRandomPassword.default.randomPassword({
    length,
    characters: [_secureRandomPassword.default.lower, _secureRandomPassword.default.upper, _secureRandomPassword.default.digits]
  });
};

exports.generateSecret = generateSecret;
const command = 'secret';
exports.command = command;
const description = 'Generates a secret key using a cryptographically-secure source of entropy';
exports.description = description;

const builder = yargs => yargs.option('length', {
  description: 'Length of the generated secret',
  type: 'integer',
  required: false,
  default: DEFAULT_LENGTH
}).option('raw', {
  description: 'Prints just the raw secret',
  type: 'boolean',
  required: false,
  default: false
}).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-secret')}`);

exports.builder = builder;

const handler = ({
  length,
  raw
}) => {
  if (raw) {
    console.log(generateSecret(length));
    return;
  }

  console.info('');
  console.info(`  ${generateSecret(length)}`);
  console.info('');
  console.info("If you're using this with dbAuth, set a SESSION_SECRET environment variable to this value.");
  console.info('');
  console.info('Keep it secret, keep it safe!');
};

exports.handler = handler;