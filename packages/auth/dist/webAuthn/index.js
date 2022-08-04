"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _browser = require("@simplewebauthn/browser");

class WebAuthnRegistrationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WebAuthnRegistrationError';
  }

}

class WebAuthnAuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WebAuthnAuthenticationError';
  }

}

class WebAuthnAlreadyRegisteredError extends WebAuthnRegistrationError {
  constructor() {
    super('This device is already registered');
    this.name = 'WebAuthnAlreadyRegisteredError';
  }

}

class WebAuthnDeviceNotFoundError extends WebAuthnAuthenticationError {
  constructor() {
    super('WebAuthn device not found');
    this.name = 'WebAuthnDeviceNotFoundError';
  }

}

class WebAuthnNoAuthenticatorError extends WebAuthnAuthenticationError {
  constructor() {
    super("This device was not recognized. Use username/password login, or if you're using iOS you can try reloading this page");
    this.name = 'WebAuthnNoAuthenticatorError';
  }

}

const isSupported = async () => {
  return await (0, _browser.platformAuthenticatorIsAvailable)();
};

const isEnabled = () => !!document.cookie.match(/webAuthn/);

const authenticationOptions = async () => {
  let options;

  try {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', "".concat(global.RWJS_API_DBAUTH_URL, "?method=webAuthnAuthOptions"), false);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(null);
    options = JSON.parse(xhr.responseText);

    if (xhr.status !== 200) {
      var _options$error;

      if ((_options$error = options.error) !== null && _options$error !== void 0 && _options$error.match(/username and password/)) {
        console.info('regex match');
        throw new WebAuthnDeviceNotFoundError();
      } else {
        console.info('no match');
        throw new WebAuthnAuthenticationError("Could not start authentication: ".concat(options.error));
      }
    }
  } catch (e) {
    console.error(e.message);
    throw new WebAuthnAuthenticationError("Could not start authentication: ".concat(e.message));
  }

  return options;
};

const authenticate = async () => {
  const authOptions = await authenticationOptions();

  try {
    const browserResponse = await (0, _browser.startAuthentication)(authOptions);
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('POST', global.RWJS_API_DBAUTH_URL, false);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send((0, _stringify.default)({
      method: 'webAuthnAuthenticate',
      ...browserResponse
    }));
    const options = JSON.parse(xhr.responseText);

    if (xhr.status !== 200) {
      throw new WebAuthnAuthenticationError("Could not complete authentication: ".concat(options.error));
    }
  } catch (e) {
    if (e.message.match(/No available authenticator recognized any of the allowed credentials/)) {
      throw new WebAuthnNoAuthenticatorError();
    } else {
      throw new WebAuthnAuthenticationError("Error while authenticating: ".concat(e.message));
    }
  }

  return true;
};

const registrationOptions = () => {
  let options;

  try {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', "".concat(global.RWJS_API_DBAUTH_URL, "?method=webAuthnRegOptions"), false);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(null);
    options = JSON.parse(xhr.responseText);

    if (xhr.status !== 200) {
      throw new WebAuthnRegistrationError("Could not start registration: ".concat(options.error));
    }
  } catch (e) {
    console.error(e);
    throw new WebAuthnRegistrationError("Could not start registration: ".concat(e.message));
  }

  return options;
};

const register = async () => {
  const options = await registrationOptions();
  let regResponse;

  try {
    regResponse = await (0, _browser.startRegistration)(options);
  } catch (e) {
    if (e.name === 'InvalidStateError') {
      throw new WebAuthnAlreadyRegisteredError();
    } else {
      throw new WebAuthnRegistrationError("Error while registering: ".concat(e.message));
    }
  }

  try {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('POST', global.RWJS_API_DBAUTH_URL, false);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send((0, _stringify.default)({
      method: 'webAuthnRegister',
      ...regResponse
    }));
    const options = JSON.parse(xhr.responseText);

    if (xhr.status !== 200) {
      throw new WebAuthnRegistrationError("Could not complete registration: ".concat(options.error));
    }
  } catch (e) {
    throw new WebAuthnRegistrationError("Error while registering: ".concat(e.message));
  }

  return true;
};

const WebAuthnClient = {
  isSupported,
  isEnabled,
  authenticate,
  register
};
var _default = WebAuthnClient;
exports.default = _default;