"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.DbAuthHandler = void 0;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _flat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/flat"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _assign = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/assign"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _base64url = _interopRequireDefault(require("base64url"));

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

var _md = _interopRequireDefault(require("md5"));

var _uuid = require("uuid");

var _cors = require("../../cors");

var _transforms = require("../../transforms");

var DbAuthError = _interopRequireWildcard(require("./errors"));

var _shared = require("./shared");

class DbAuthHandler {
  // class constant: list of auth methods that are supported
  static get METHODS() {
    return ['forgotPassword', 'getToken', 'login', 'logout', 'resetPassword', 'signup', 'validateResetToken', 'webAuthnRegOptions', 'webAuthnRegister', 'webAuthnAuthOptions', 'webAuthnAuthenticate'];
  } // class constant: maps the auth functions to their required HTTP verb for access


  static get VERBS() {
    return {
      forgotPassword: 'POST',
      getToken: 'GET',
      login: 'POST',
      logout: 'POST',
      resetPassword: 'POST',
      signup: 'POST',
      validateResetToken: 'POST',
      webAuthnRegOptions: 'GET',
      webAuthnRegister: 'POST',
      webAuthnAuthOptions: 'GET',
      webAuthnAuthenticate: 'POST'
    };
  } // default to epoch when we want to expire


  static get PAST_EXPIRES_DATE() {
    return new Date('1970-01-01T00:00:00.000+00:00').toUTCString();
  } // generate a new token (standard UUID)


  static get CSRF_TOKEN() {
    return (0, _uuid.v4)();
  }

  static get AVAILABLE_WEBAUTHN_TRANSPORTS() {
    return ['usb', 'ble', 'nfc', 'internal'];
  } // returns the set-cookie header to mark the cookie as expired ("deletes" the session)

  /**
   * The header keys are case insensitive, but Fastify prefers these to be lowercase.
   * Therefore, we want to ensure that the headers are always lowercase and unique
   * for compliance with HTTP/2.
   *
   * @see: https://www.rfc-editor.org/rfc/rfc7540#section-8.1.2
   */


  get _deleteSessionHeader() {
    return {
      'set-cookie': ['session=', ...this._cookieAttributes({
        expires: 'now'
      })].join(';')
    };
  }

  constructor(event, context, options) {
    this.event = void 0;
    this.context = void 0;
    this.options = void 0;
    this.cookie = void 0;
    this.params = void 0;
    this.db = void 0;
    this.dbAccessor = void 0;
    this.dbCredentialAccessor = void 0;
    this.headerCsrfToken = void 0;
    this.hasInvalidSession = void 0;
    this.session = void 0;
    this.sessionCsrfToken = void 0;
    this.corsContext = void 0;
    this.sessionExpiresDate = void 0;
    this.webAuthnExpiresDate = void 0;
    this.event = event;
    this.context = context;
    this.options = options;
    this.cookie = (0, _shared.extractCookie)(this.event);

    this._validateOptions();

    this.params = this._parseBody();
    this.db = this.options.db;
    this.dbAccessor = this.db[this.options.authModelAccessor];
    this.dbCredentialAccessor = this.options.credentialModelAccessor ? this.db[this.options.credentialModelAccessor] : null;
    this.headerCsrfToken = this.event.headers['csrf-token'];
    this.hasInvalidSession = false;
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setSeconds(sessionExpiresAt.getSeconds() + this.options.login.expires);
    this.sessionExpiresDate = sessionExpiresAt.toUTCString();
    const webAuthnExpiresAt = new Date();
    webAuthnExpiresAt.setSeconds(webAuthnExpiresAt.getSeconds() + (this.options?.webAuthn?.expires || 0));
    this.webAuthnExpiresDate = webAuthnExpiresAt.toUTCString(); // Note that we handle these headers differently in functions/graphql.ts
    // because it's handled by graphql-yoga, so we map the cors config to yoga config
    // See packages/graphql-server/src/__tests__/mapRwCorsToYoga.test.ts

    if (options.cors) {
      this.corsContext = (0, _cors.createCorsContext)(options.cors);
    }

    try {
      const [session, csrfToken] = (0, _shared.decryptSession)((0, _shared.getSession)(this.cookie));
      this.session = session;
      this.sessionCsrfToken = csrfToken;
    } catch (e) {
      // if session can't be decrypted, keep track so we can log them out when
      // the auth method is called
      if (e instanceof DbAuthError.SessionDecryptionError) {
        this.hasInvalidSession = true;
      } else {
        throw e;
      }
    }
  } // Actual function that triggers everything else to happen: `login`, `signup`,
  // etc. is called from here, after some checks to make sure the request is good


  async invoke() {
    const request = (0, _transforms.normalizeRequest)(this.event);
    let corsHeaders = {};

    if (this.corsContext) {
      corsHeaders = this.corsContext.getRequestHeaders(request); // Return CORS headers for OPTIONS requests

      if (this.corsContext.shouldHandleCors(request)) {
        return this._buildResponseWithCorsHeaders({
          body: '',
          statusCode: 200
        }, corsHeaders);
      }
    } // if there was a problem decryption the session, just return the logout
    // response immediately


    if (this.hasInvalidSession) {
      return this._buildResponseWithCorsHeaders(this._ok(...this._logoutResponse()), corsHeaders);
    }

    try {
      var _context;

      const method = this._getAuthMethod(); // get the auth method the incoming request is trying to call


      if (!(0, _includes.default)(_context = DbAuthHandler.METHODS).call(_context, method)) {
        return this._buildResponseWithCorsHeaders(this._notFound(), corsHeaders);
      } // make sure it's using the correct verb, GET vs POST


      if (this.event.httpMethod !== DbAuthHandler.VERBS[method]) {
        return this._buildResponseWithCorsHeaders(this._notFound(), corsHeaders);
      } // call whatever auth method was requested and return the body and headers


      const [body, headers, options = {
        statusCode: 200
      }] = await this[method]();
      return this._buildResponseWithCorsHeaders(this._ok(body, headers, options), corsHeaders);
    } catch (e) {
      if (e instanceof DbAuthError.WrongVerbError) {
        return this._buildResponseWithCorsHeaders(this._notFound(), corsHeaders);
      } else {
        return this._buildResponseWithCorsHeaders(this._badRequest(e.message || e), corsHeaders);
      }
    }
  }

  async forgotPassword() {
    const {
      enabled = true
    } = this.options.forgotPassword;

    if (!enabled) {
      throw new DbAuthError.FlowNotEnabledError(this.options.forgotPassword?.errors?.flowNotEnabled || `Forgot password flow is not enabled`);
    }

    const {
      username
    } = this.params; // was the username sent in at all?

    if (!username || (0, _trim.default)(username).call(username) === '') {
      throw new DbAuthError.UsernameRequiredError(this.options.forgotPassword?.errors?.usernameRequired || `Username is required`);
    }

    let user;

    try {
      user = await this.dbAccessor.findUnique({
        where: {
          [this.options.authFields.username]: username
        }
      });
    } catch (e) {
      throw new DbAuthError.GenericError();
    }

    if (user) {
      const tokenExpires = new Date();
      tokenExpires.setSeconds(tokenExpires.getSeconds() + this.options.forgotPassword.expires); // generate a token

      let token = (0, _md.default)((0, _uuid.v4)());
      const buffer = Buffer.from(token);
      token = buffer.toString('base64').replace('=', '').substring(0, 16);

      try {
        // set token and expires time
        user = await this.dbAccessor.update({
          where: {
            [this.options.authFields.id]: user[this.options.authFields.id]
          },
          data: {
            [this.options.authFields.resetToken]: token,
            [this.options.authFields.resetTokenExpiresAt]: tokenExpires
          }
        });
      } catch (e) {
        throw new DbAuthError.GenericError();
      } // call user-defined handler in their functions/auth.js


      const response = await this.options.forgotPassword.handler(this._sanitizeUser(user));
      return [response ? (0, _stringify.default)(response) : '', { ...this._deleteSessionHeader
      }];
    } else {
      throw new DbAuthError.UsernameNotFoundError(this.options.forgotPassword?.errors?.usernameNotFound || `Username '${username} not found`);
    }
  }

  async getToken() {
    try {
      const user = await this._getCurrentUser(); // need to return *something* for our existing Authorization header stuff
      // to work, so return the user's ID in case we can use it for something
      // in the future

      return [user[this.options.authFields.id]];
    } catch (e) {
      if (e instanceof DbAuthError.NotLoggedInError) {
        return this._logoutResponse();
      } else {
        return this._logoutResponse({
          error: e.message
        });
      }
    }
  }

  async login() {
    const {
      enabled = true
    } = this.options.login;

    if (!enabled) {
      throw new DbAuthError.FlowNotEnabledError(this.options.login?.errors?.flowNotEnabled || `Login flow is not enabled`);
    }

    const {
      username,
      password
    } = this.params;
    const dbUser = await this._verifyUser(username, password);
    const handlerUser = await this.options.login.handler(dbUser);

    if (handlerUser == null || handlerUser[this.options.authFields.id] == null) {
      throw new DbAuthError.NoUserIdError();
    }

    return this._loginResponse(handlerUser);
  }

  logout() {
    return this._logoutResponse();
  }

  async resetPassword() {
    var _context2, _context3;

    const {
      enabled = true
    } = this.options.resetPassword;

    if (!enabled) {
      throw new DbAuthError.FlowNotEnabledError(this.options.resetPassword?.errors?.flowNotEnabled || `Reset password flow is not enabled`);
    }

    const {
      password,
      resetToken
    } = this.params; // is the resetToken present?

    if (resetToken == null || (0, _trim.default)(_context2 = String(resetToken)).call(_context2) === '') {
      throw new DbAuthError.ResetTokenRequiredError(this.options.resetPassword?.errors?.resetTokenRequired);
    } // is password present?


    if (password == null || (0, _trim.default)(_context3 = String(password)).call(_context3) === '') {
      throw new DbAuthError.PasswordRequiredError();
    }

    let user = await this._findUserByToken(resetToken);

    const [hashedPassword] = this._hashPassword(password, user.salt);

    if (!this.options.resetPassword.allowReusedPassword && user.hashedPassword === hashedPassword) {
      throw new DbAuthError.ReusedPasswordError(this.options.resetPassword?.errors?.reusedPassword);
    }

    try {
      // if we got here then we can update the password in the database
      user = await this.dbAccessor.update({
        where: {
          [this.options.authFields.id]: user[this.options.authFields.id]
        },
        data: {
          [this.options.authFields.hashedPassword]: hashedPassword,
          [this.options.authFields.resetToken]: null,
          [this.options.authFields.resetTokenExpiresAt]: null
        }
      });
    } catch (e) {
      throw new DbAuthError.GenericError();
    } // call the user-defined handler so they can decide what to do with this user


    const response = await this.options.resetPassword.handler(this._sanitizeUser(user)); // returning the user from the handler means to log them in automatically

    if (response) {
      return this._loginResponse(user);
    } else {
      return this._logoutResponse({});
    }
  }

  async signup() {
    const {
      enabled = true
    } = this.options.signup;

    if (!enabled) {
      throw new DbAuthError.FlowNotEnabledError(this.options.signup?.errors?.flowNotEnabled || `Signup flow is not enabled`);
    }

    const userOrMessage = await this._createUser(); // at this point `user` is either an actual user, in which case log the
    // user in automatically, or it's a string, which is a message to show
    // the user (something like "please verify your email")

    if (typeof userOrMessage === 'object') {
      const user = userOrMessage;
      return this._loginResponse(user, 201);
    } else {
      const message = userOrMessage;
      return [(0, _stringify.default)({
        message
      }), {}, {
        statusCode: 201
      }];
    }
  }

  async validateResetToken() {
    var _context4;

    // is token present at all?
    if (this.params.resetToken == null || (0, _trim.default)(_context4 = String(this.params.resetToken)).call(_context4) === '') {
      throw new DbAuthError.ResetTokenRequiredError(this.options.resetPassword?.errors?.resetTokenRequired);
    }

    const user = await this._findUserByToken(this.params.resetToken);
    return [(0, _stringify.default)(this._sanitizeUser(user)), { ...this._deleteSessionHeader
    }];
  } // browser submits WebAuthn credentials


  async webAuthnAuthenticate() {
    var _context5;

    const {
      verifyAuthenticationResponse
    } = require('@simplewebauthn/server');

    const webAuthnOptions = this.options.webAuthn;

    if (!webAuthnOptions || !webAuthnOptions.enabled) {
      throw new DbAuthError.WebAuthnError('WebAuthn is not enabled');
    }

    const jsonBody = JSON.parse(this.event.body);
    const credential = await this.dbCredentialAccessor.findFirst({
      where: {
        id: jsonBody.rawId
      }
    });

    if (!credential) {
      throw new DbAuthError.WebAuthnError('Credentials not found');
    }

    const user = await this.dbAccessor.findFirst({
      where: {
        [this.options.authFields.id]: credential[webAuthnOptions.credentialFields.userId]
      }
    });
    let verification;

    try {
      const opts = {
        credential: jsonBody,
        expectedChallenge: user[this.options.authFields.challenge],
        expectedOrigin: webAuthnOptions.origin,
        expectedRPID: webAuthnOptions.domain,
        authenticator: {
          credentialID: _base64url.default.toBuffer(credential[webAuthnOptions.credentialFields.id]),
          credentialPublicKey: credential[webAuthnOptions.credentialFields.publicKey],
          counter: credential[webAuthnOptions.credentialFields.counter],
          transports: credential[webAuthnOptions.credentialFields.transports] ? JSON.parse(credential[webAuthnOptions.credentialFields.transports]) : DbAuthHandler.AVAILABLE_WEBAUTHN_TRANSPORTS
        },
        requireUserVerification: true
      };
      verification = verifyAuthenticationResponse(opts);
    } catch (e) {
      throw new DbAuthError.WebAuthnError(e.message);
    } finally {
      // whether it worked or errored, clear the challenge in the user record
      // and user can get a new one next time they try to authenticate
      await this._saveChallenge(user[this.options.authFields.id], null);
    }

    const {
      verified,
      authenticationInfo
    } = verification;

    if (verified) {
      // update counter in credentials
      await this.dbCredentialAccessor.update({
        where: {
          [webAuthnOptions.credentialFields.id]: credential[webAuthnOptions.credentialFields.id]
        },
        data: {
          [webAuthnOptions.credentialFields.counter]: authenticationInfo.newCounter
        }
      });
    } // get the regular `login` cookies


    const [, loginHeaders] = this._loginResponse(user);

    const cookies = (0, _flat.default)(_context5 = [this._webAuthnCookie(jsonBody.rawId, this.webAuthnExpiresDate), loginHeaders['set-cookie']]).call(_context5);
    return [verified, {
      'set-cookie': cookies
    }];
  } // get options for a WebAuthn authentication


  async webAuthnAuthOptions() {
    const {
      generateAuthenticationOptions
    } = require('@simplewebauthn/server');

    if (this.options.webAuthn === undefined || !this.options.webAuthn.enabled) {
      throw new DbAuthError.WebAuthnError('WebAuthn is not enabled');
    }

    const webAuthnOptions = this.options.webAuthn;
    const credentialId = (0, _shared.webAuthnSession)(this.event);
    let user;

    if (credentialId) {
      user = await this.dbCredentialAccessor.findFirst({
        where: {
          [webAuthnOptions.credentialFields.id]: credentialId
        }
      }).user();
    } else {
      // webauthn session not present, fallback to getting user from regular
      // session cookie
      user = await this._getCurrentUser();
    } // webauthn cookie has been tampered with or UserCredential has been deleted
    // from the DB, remove their cookie so it doesn't happen again


    if (!user) {
      return [{
        error: 'Log in with username and password to enable WebAuthn'
      }, {
        'set-cookie': this._webAuthnCookie('', 'now')
      }, {
        statusCode: 400
      }];
    }

    const credentials = await this.dbCredentialAccessor.findMany({
      where: {
        [webAuthnOptions.credentialFields.userId]: user[this.options.authFields.id]
      }
    });
    const someOptions = {
      timeout: webAuthnOptions.timeout || 60000,
      allowCredentials: (0, _map.default)(credentials).call(credentials, cred => ({
        id: _base64url.default.toBuffer(cred[webAuthnOptions.credentialFields.id]),
        type: 'public-key',
        transports: cred[webAuthnOptions.credentialFields.transports] ? JSON.parse(cred[webAuthnOptions.credentialFields.transports]) : DbAuthHandler.AVAILABLE_WEBAUTHN_TRANSPORTS
      })),
      userVerification: 'required',
      rpID: webAuthnOptions.domain
    };
    const authOptions = generateAuthenticationOptions(someOptions);
    await this._saveChallenge(user[this.options.authFields.id], authOptions.challenge);
    return [authOptions];
  } // get options for WebAuthn registration


  async webAuthnRegOptions() {
    const {
      generateRegistrationOptions
    } = require('@simplewebauthn/server');

    if (!this.options?.webAuthn?.enabled) {
      throw new DbAuthError.WebAuthnError('WebAuthn is not enabled');
    }

    const webAuthnOptions = this.options.webAuthn;
    const user = await this._getCurrentUser();
    const options = {
      rpName: webAuthnOptions.name,
      rpID: webAuthnOptions.domain,
      userID: user[this.options.authFields.id],
      userName: user[this.options.authFields.username],
      timeout: webAuthnOptions?.timeout || 60000,
      excludeCredentials: [],
      authenticatorSelection: {
        userVerification: 'required'
      },
      // Support the two most common algorithms: ES256, and RS256
      supportedAlgorithmIDs: [-7, -257]
    }; // if a type is specified other than `any` assign it (the default behavior
    // of this prop if `undefined` means to allow any authenticator)

    if (webAuthnOptions.type && webAuthnOptions.type !== 'any') {
      options.authenticatorSelection = (0, _assign.default)(options.authenticatorSelection || {}, {
        authenticatorAttachment: webAuthnOptions.type
      });
    }

    const regOptions = generateRegistrationOptions(options);
    await this._saveChallenge(user[this.options.authFields.id], regOptions.challenge);
    return [regOptions];
  } // browser submits WebAuthn credentials for the first time on a new device


  async webAuthnRegister() {
    const {
      verifyRegistrationResponse
    } = require('@simplewebauthn/server');

    if (this.options.webAuthn === undefined || !this.options.webAuthn.enabled) {
      throw new DbAuthError.WebAuthnError('WebAuthn is not enabled');
    }

    const user = await this._getCurrentUser();
    const jsonBody = JSON.parse(this.event.body);
    let verification;

    try {
      const options = {
        credential: jsonBody,
        expectedChallenge: user[this.options.authFields.challenge],
        expectedOrigin: this.options.webAuthn.origin,
        expectedRPID: this.options.webAuthn.domain,
        requireUserVerification: true
      };
      verification = await verifyRegistrationResponse(options);
    } catch (e) {
      throw new DbAuthError.WebAuthnError(e.message);
    }

    const {
      verified,
      registrationInfo
    } = verification;
    let plainCredentialId;

    if (verified && registrationInfo) {
      const {
        credentialPublicKey,
        credentialID,
        counter
      } = registrationInfo;
      plainCredentialId = _base64url.default.encode(credentialID);
      const existingDevice = await this.dbCredentialAccessor.findFirst({
        where: {
          id: plainCredentialId,
          userId: user[this.options.authFields.id]
        }
      });

      if (!existingDevice) {
        await this.dbCredentialAccessor.create({
          data: {
            [this.options.webAuthn.credentialFields.id]: plainCredentialId,
            [this.options.webAuthn.credentialFields.userId]: user[this.options.authFields.id],
            [this.options.webAuthn.credentialFields.publicKey]: credentialPublicKey,
            [this.options.webAuthn.credentialFields.transports]: jsonBody.transports ? (0, _stringify.default)(jsonBody.transports) : null,
            [this.options.webAuthn.credentialFields.counter]: counter
          }
        });
      }
    } else {
      throw new DbAuthError.WebAuthnError('Registration failed');
    } // clear challenge


    await this._saveChallenge(user[this.options.authFields.id], null);
    return [verified, {
      'set-cookie': this._webAuthnCookie(plainCredentialId, this.webAuthnExpiresDate)
    }];
  } // validates that we have all the ENV and options we need to login/signup


  _validateOptions() {
    // must have a SESSION_SECRET so we can encrypt/decrypt the cookie
    if (!process.env.SESSION_SECRET) {
      throw new DbAuthError.NoSessionSecretError();
    } // must have an expiration time set for the session cookie


    if (this.options?.login?.enabled !== false && !this.options?.login?.expires) {
      throw new DbAuthError.NoSessionExpirationError();
    } // must have a login handler to actually log a user in


    if (this.options?.login?.enabled !== false && !this.options?.login?.handler) {
      throw new DbAuthError.NoLoginHandlerError();
    } // must have a signup handler to define how to create a new user


    if (this.options?.signup?.enabled !== false && !this.options?.signup?.handler) {
      throw new DbAuthError.NoSignupHandlerError();
    } // must have a forgot password handler to define how to notify user of reset token


    if (this.options?.forgotPassword?.enabled !== false && !this.options?.forgotPassword?.handler) {
      throw new DbAuthError.NoForgotPasswordHandlerError();
    } // must have a reset password handler to define what to do with user once password changed


    if (this.options?.resetPassword?.enabled !== false && !this.options?.resetPassword?.handler) {
      throw new DbAuthError.NoResetPasswordHandlerError();
    } // must have webAuthn config if credentialModelAccessor present and vice versa


    if (this.options?.credentialModelAccessor && !this.options?.webAuthn || this.options?.webAuthn && !this.options?.credentialModelAccessor) {
      throw new DbAuthError.NoWebAuthnConfigError();
    }

    if (this.options?.webAuthn?.enabled && (!this.options?.webAuthn?.name || !this.options?.webAuthn?.domain || !this.options?.webAuthn?.origin || !this.options?.webAuthn?.credentialFields)) {
      throw new DbAuthError.MissingWebAuthnConfigError();
    }
  } // Save challenge string for WebAuthn


  async _saveChallenge(userId, value) {
    await this.dbAccessor.update({
      where: {
        [this.options.authFields.id]: userId
      },
      data: {
        [this.options.authFields.challenge]: value
      }
    });
  } // returns the string for the webAuthn set-cookie header


  _webAuthnCookie(id, expires) {
    return [`webAuthn=${id}`, ...this._cookieAttributes({
      expires,
      options: {
        HttpOnly: false
      }
    })].join(';');
  } // removes sensitive fields from user before sending over the wire


  _sanitizeUser(user) {
    const sanitized = JSON.parse((0, _stringify.default)(user));
    delete sanitized[this.options.authFields.hashedPassword];
    delete sanitized[this.options.authFields.salt];
    return sanitized;
  } // parses the event body into JSON, whether it's base64 encoded or not


  _parseBody() {
    if (this.event.body) {
      if (this.event.isBase64Encoded) {
        return JSON.parse(Buffer.from(this.event.body || '', 'base64').toString('utf-8'));
      } else {
        return JSON.parse(this.event.body);
      }
    } else {
      return {};
    }
  } // returns all the cookie attributes in an array with the proper expiration date
  //
  // pass the argument `expires` set to "now" to get the attributes needed to expire
  // the session, or "future" (or left out completely) to set to `futureExpiresDate`


  _cookieAttributes({
    expires = 'now',
    options = {}
  }) {
    var _context6, _context7;

    const cookieOptions = { ...this.options.cookie,
      ...options
    } || { ...options
    };
    const meta = (0, _filter.default)(_context6 = (0, _map.default)(_context7 = (0, _keys.default)(cookieOptions)).call(_context7, key => {
      const optionValue = cookieOptions[key]; // Convert the options to valid cookie string

      if (optionValue === true) {
        return key;
      } else if (optionValue === false) {
        return null;
      } else {
        return `${key}=${optionValue}`;
      }
    })).call(_context6, v => v);
    const expiresAt = expires === 'now' ? DbAuthHandler.PAST_EXPIRES_DATE : expires;
    meta.push(`Expires=${expiresAt}`);
    return meta;
  } // encrypts a string with the SESSION_SECRET


  _encrypt(data) {
    return _cryptoJs.default.AES.encrypt(data, process.env.SESSION_SECRET);
  } // returns the set-cookie header to be returned in the request (effectively
  // creates the session)


  _createSessionHeader(data, csrfToken) {
    const session = (0, _stringify.default)(data) + ';' + csrfToken;

    const encrypted = this._encrypt(session);

    const cookie = [`session=${encrypted.toString()}`, ...this._cookieAttributes({
      expires: this.sessionExpiresDate
    })].join(';');
    return {
      'set-cookie': cookie
    };
  } // checks the CSRF token in the header against the CSRF token in the session
  // and throw an error if they are not the same (not used yet)


  _validateCsrf() {
    if (this.sessionCsrfToken !== this.headerCsrfToken) {
      throw new DbAuthError.CsrfTokenMismatchError();
    }

    return true;
  }

  async _findUserByToken(token) {
    const tokenExpires = new Date();
    tokenExpires.setSeconds(tokenExpires.getSeconds() - this.options.forgotPassword.expires);
    const user = await this.dbAccessor.findFirst({
      where: {
        [this.options.authFields.resetToken]: token
      }
    }); // user not found with the given token

    if (!user) {
      throw new DbAuthError.ResetTokenInvalidError(this.options.resetPassword?.errors?.resetTokenInvalid);
    } // token has expired


    if (user[this.options.authFields.resetTokenExpiresAt] < tokenExpires) {
      await this._clearResetToken(user);
      throw new DbAuthError.ResetTokenExpiredError(this.options.resetPassword?.errors?.resetTokenExpired);
    }

    return user;
  } // removes the resetToken from the database


  async _clearResetToken(user) {
    try {
      await this.dbAccessor.update({
        where: {
          [this.options.authFields.id]: user[this.options.authFields.id]
        },
        data: {
          [this.options.authFields.resetToken]: null,
          [this.options.authFields.resetTokenExpiresAt]: null
        }
      });
    } catch (e) {
      throw new DbAuthError.GenericError();
    }
  } // verifies that a username and password are correct, and returns the user if so


  async _verifyUser(username, password) {
    var _context8, _context9;

    // do we have all the query params we need to check the user?
    if (!username || (0, _trim.default)(_context8 = username.toString()).call(_context8) === '' || !password || (0, _trim.default)(_context9 = password.toString()).call(_context9) === '') {
      throw new DbAuthError.UsernameAndPasswordRequiredError(this.options.login?.errors?.usernameOrPasswordMissing);
    }

    let user;

    try {
      // does user exist?
      user = await this.dbAccessor.findUnique({
        where: {
          [this.options.authFields.username]: username
        }
      });
    } catch (e) {
      throw new DbAuthError.GenericError();
    }

    if (!user) {
      throw new DbAuthError.UserNotFoundError(username, this.options.login?.errors?.usernameNotFound);
    } // is password correct?


    const [hashedPassword, _salt] = this._hashPassword(password, user[this.options.authFields.salt]);

    if (hashedPassword === user[this.options.authFields.hashedPassword]) {
      return user;
    } else {
      throw new DbAuthError.IncorrectPasswordError(username, this.options.login?.errors?.incorrectPassword);
    }
  } // gets the user from the database and returns only its ID


  async _getCurrentUser() {
    if (!this.session?.id) {
      throw new DbAuthError.NotLoggedInError();
    }

    const select = {
      [this.options.authFields.id]: true,
      [this.options.authFields.username]: true
    };

    if (this.options.webAuthn?.enabled && this.options.authFields.challenge) {
      select[this.options.authFields.challenge] = true;
    }

    let user;

    try {
      user = await this.dbAccessor.findUnique({
        where: {
          [this.options.authFields.id]: this.session?.id
        },
        select
      });
    } catch (e) {
      throw new DbAuthError.GenericError(e.message);
    }

    if (!user) {
      throw new DbAuthError.UserNotFoundError();
    }

    return user;
  } // creates and returns a user, first checking that the username/password
  // values pass validation


  async _createUser() {
    const {
      username,
      password,
      ...userAttributes
    } = this.params;

    if (this._validateField('username', username) && this._validateField('password', password)) {
      const user = await this.dbAccessor.findUnique({
        where: {
          [this.options.authFields.username]: username
        }
      });

      if (user) {
        throw new DbAuthError.DuplicateUsernameError(username, this.options.signup?.errors?.usernameTaken);
      } // if we get here everything is good, call the app's signup handler and let
      // them worry about scrubbing data and saving to the DB


      const [hashedPassword, salt] = this._hashPassword(password);

      const newUser = await this.options.signup.handler({
        username,
        hashedPassword,
        salt,
        userAttributes
      });
      return newUser;
    }
  } // hashes a password using either the given `salt` argument, or creates a new
  // salt and hashes using that. Either way, returns an array with [hash, salt]


  _hashPassword(text, salt) {
    const useSalt = salt || _cryptoJs.default.lib.WordArray.random(128 / 8).toString();

    return [_cryptoJs.default.PBKDF2(text, useSalt, {
      keySize: 256 / 32
    }).toString(), useSalt];
  } // figure out which auth method we're trying to call


  _getAuthMethod() {
    var _context10;

    // try getting it from the query string, /.redwood/functions/auth?method=[methodName]
    let methodName = this.event.queryStringParameters?.method;

    if (!(0, _includes.default)(_context10 = DbAuthHandler.METHODS).call(_context10, methodName) && this.params) {
      // try getting it from the body in JSON: { method: [methodName] }
      try {
        methodName = this.params.method;
      } catch (e) {// there's no body, or it's not JSON, `handler` will return a 404
      }
    }

    return methodName;
  } // checks that a single field meets validation requirements and
  // currently checks for presense only


  _validateField(name, value) {
    // check for presense
    if (!value || (0, _trim.default)(value).call(value) === '') {
      throw new DbAuthError.FieldRequiredError(name, this.options.signup?.errors?.fieldMissing);
    } else {
      return true;
    }
  }

  _loginResponse(user, statusCode = 200) {
    const sessionData = {
      id: user[this.options.authFields.id]
    }; // TODO: this needs to go into graphql somewhere so that each request makes
    // a new CSRF token and sets it in both the encrypted session and the
    // csrf-token header

    const csrfToken = DbAuthHandler.CSRF_TOKEN;
    return [sessionData, {
      'csrf-token': csrfToken,
      ...this._createSessionHeader(sessionData, csrfToken)
    }, {
      statusCode
    }];
  }

  _logoutResponse(response) {
    return [response ? (0, _stringify.default)(response) : '', { ...this._deleteSessionHeader
    }];
  }

  _ok(body, headers = {}, options = {
    statusCode: 200
  }) {
    return {
      statusCode: options.statusCode,
      body: typeof body === 'string' ? body : (0, _stringify.default)(body),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
  }

  _notFound() {
    return {
      statusCode: 404
    };
  }

  _badRequest(message) {
    return {
      statusCode: 400,
      body: (0, _stringify.default)({
        error: message
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  _buildResponseWithCorsHeaders(response, corsHeaders) {
    return { ...response,
      headers: { ...(response.headers || {}),
        ...corsHeaders
      }
    };
  }

}

exports.DbAuthHandler = DbAuthHandler;