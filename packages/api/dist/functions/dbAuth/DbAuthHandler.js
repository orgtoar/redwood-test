"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DbAuthHandler = void 0;

var _base64url = _interopRequireDefault(require("base64url"));

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

var _md = _interopRequireDefault(require("md5"));

var _uuid = require("uuid");

var _cors = require("../../cors");

var _transforms = require("../../transforms");

var DbAuthError = _interopRequireWildcard(require("./errors"));

var _shared = require("./shared");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
    var _this$options, _this$options$webAuth;

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
    webAuthnExpiresAt.setSeconds(webAuthnExpiresAt.getSeconds() + (((_this$options = this.options) === null || _this$options === void 0 ? void 0 : (_this$options$webAuth = _this$options.webAuthn) === null || _this$options$webAuth === void 0 ? void 0 : _this$options$webAuth.expires) || 0));
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
      const method = this._getAuthMethod(); // get the auth method the incoming request is trying to call


      if (!DbAuthHandler.METHODS.includes(method)) {
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
      var _this$options$forgotP, _this$options$forgotP2;

      throw new DbAuthError.FlowNotEnabledError(((_this$options$forgotP = this.options.forgotPassword) === null || _this$options$forgotP === void 0 ? void 0 : (_this$options$forgotP2 = _this$options$forgotP.errors) === null || _this$options$forgotP2 === void 0 ? void 0 : _this$options$forgotP2.flowNotEnabled) || `Forgot password flow is not enabled`);
    }

    const {
      username
    } = this.params; // was the username sent in at all?

    if (!username || username.trim() === '') {
      var _this$options$forgotP3, _this$options$forgotP4;

      throw new DbAuthError.UsernameRequiredError(((_this$options$forgotP3 = this.options.forgotPassword) === null || _this$options$forgotP3 === void 0 ? void 0 : (_this$options$forgotP4 = _this$options$forgotP3.errors) === null || _this$options$forgotP4 === void 0 ? void 0 : _this$options$forgotP4.usernameRequired) || `Username is required`);
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
      return [response ? JSON.stringify(response) : '', { ...this._deleteSessionHeader
      }];
    } else {
      var _this$options$forgotP5, _this$options$forgotP6;

      throw new DbAuthError.UsernameNotFoundError(((_this$options$forgotP5 = this.options.forgotPassword) === null || _this$options$forgotP5 === void 0 ? void 0 : (_this$options$forgotP6 = _this$options$forgotP5.errors) === null || _this$options$forgotP6 === void 0 ? void 0 : _this$options$forgotP6.usernameNotFound) || `Username '${username} not found`);
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
      var _this$options$login, _this$options$login$e;

      throw new DbAuthError.FlowNotEnabledError(((_this$options$login = this.options.login) === null || _this$options$login === void 0 ? void 0 : (_this$options$login$e = _this$options$login.errors) === null || _this$options$login$e === void 0 ? void 0 : _this$options$login$e.flowNotEnabled) || `Login flow is not enabled`);
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
    const {
      enabled = true
    } = this.options.resetPassword;

    if (!enabled) {
      var _this$options$resetPa, _this$options$resetPa2;

      throw new DbAuthError.FlowNotEnabledError(((_this$options$resetPa = this.options.resetPassword) === null || _this$options$resetPa === void 0 ? void 0 : (_this$options$resetPa2 = _this$options$resetPa.errors) === null || _this$options$resetPa2 === void 0 ? void 0 : _this$options$resetPa2.flowNotEnabled) || `Reset password flow is not enabled`);
    }

    const {
      password,
      resetToken
    } = this.params; // is the resetToken present?

    if (resetToken == null || String(resetToken).trim() === '') {
      var _this$options$resetPa3, _this$options$resetPa4;

      throw new DbAuthError.ResetTokenRequiredError((_this$options$resetPa3 = this.options.resetPassword) === null || _this$options$resetPa3 === void 0 ? void 0 : (_this$options$resetPa4 = _this$options$resetPa3.errors) === null || _this$options$resetPa4 === void 0 ? void 0 : _this$options$resetPa4.resetTokenRequired);
    } // is password present?


    if (password == null || String(password).trim() === '') {
      throw new DbAuthError.PasswordRequiredError();
    }

    let user = await this._findUserByToken(resetToken);

    const [hashedPassword] = this._hashPassword(password, user.salt);

    if (!this.options.resetPassword.allowReusedPassword && user.hashedPassword === hashedPassword) {
      var _this$options$resetPa5, _this$options$resetPa6;

      throw new DbAuthError.ReusedPasswordError((_this$options$resetPa5 = this.options.resetPassword) === null || _this$options$resetPa5 === void 0 ? void 0 : (_this$options$resetPa6 = _this$options$resetPa5.errors) === null || _this$options$resetPa6 === void 0 ? void 0 : _this$options$resetPa6.reusedPassword);
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
      var _this$options$signup, _this$options$signup$;

      throw new DbAuthError.FlowNotEnabledError(((_this$options$signup = this.options.signup) === null || _this$options$signup === void 0 ? void 0 : (_this$options$signup$ = _this$options$signup.errors) === null || _this$options$signup$ === void 0 ? void 0 : _this$options$signup$.flowNotEnabled) || `Signup flow is not enabled`);
    }

    const userOrMessage = await this._createUser(); // at this point `user` is either an actual user, in which case log the
    // user in automatically, or it's a string, which is a message to show
    // the user (something like "please verify your email")

    if (typeof userOrMessage === 'object') {
      const user = userOrMessage;
      return this._loginResponse(user, 201);
    } else {
      const message = userOrMessage;
      return [JSON.stringify({
        message
      }), {}, {
        statusCode: 201
      }];
    }
  }

  async validateResetToken() {
    // is token present at all?
    if (this.params.resetToken == null || String(this.params.resetToken).trim() === '') {
      var _this$options$resetPa7, _this$options$resetPa8;

      throw new DbAuthError.ResetTokenRequiredError((_this$options$resetPa7 = this.options.resetPassword) === null || _this$options$resetPa7 === void 0 ? void 0 : (_this$options$resetPa8 = _this$options$resetPa7.errors) === null || _this$options$resetPa8 === void 0 ? void 0 : _this$options$resetPa8.resetTokenRequired);
    }

    const user = await this._findUserByToken(this.params.resetToken);
    return [JSON.stringify(this._sanitizeUser(user)), { ...this._deleteSessionHeader
    }];
  } // browser submits WebAuthn credentials


  async webAuthnAuthenticate() {
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

    const cookies = [this._webAuthnCookie(jsonBody.rawId, this.webAuthnExpiresDate), loginHeaders['set-cookie']].flat();
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
      allowCredentials: credentials.map(cred => ({
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
    var _this$options2, _this$options2$webAut;

    const {
      generateRegistrationOptions
    } = require('@simplewebauthn/server');

    if (!((_this$options2 = this.options) !== null && _this$options2 !== void 0 && (_this$options2$webAut = _this$options2.webAuthn) !== null && _this$options2$webAut !== void 0 && _this$options2$webAut.enabled)) {
      throw new DbAuthError.WebAuthnError('WebAuthn is not enabled');
    }

    const webAuthnOptions = this.options.webAuthn;
    const user = await this._getCurrentUser();
    const options = {
      rpName: webAuthnOptions.name,
      rpID: webAuthnOptions.domain,
      userID: user[this.options.authFields.id],
      userName: user[this.options.authFields.username],
      timeout: (webAuthnOptions === null || webAuthnOptions === void 0 ? void 0 : webAuthnOptions.timeout) || 60000,
      excludeCredentials: [],
      authenticatorSelection: {
        userVerification: 'required'
      },
      // Support the two most common algorithms: ES256, and RS256
      supportedAlgorithmIDs: [-7, -257]
    }; // if a type is specified other than `any` assign it (the default behavior
    // of this prop if `undefined` means to allow any authenticator)

    if (webAuthnOptions.type && webAuthnOptions.type !== 'any') {
      options.authenticatorSelection = Object.assign(options.authenticatorSelection || {}, {
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
            [this.options.webAuthn.credentialFields.transports]: jsonBody.transports ? JSON.stringify(jsonBody.transports) : null,
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
    var _this$options3, _this$options3$login, _this$options4, _this$options4$login, _this$options5, _this$options5$login, _this$options6, _this$options6$login, _this$options7, _this$options7$signup, _this$options8, _this$options8$signup, _this$options9, _this$options9$forgot, _this$options10, _this$options10$forgo, _this$options11, _this$options11$reset, _this$options12, _this$options12$reset, _this$options13, _this$options14, _this$options15, _this$options16, _this$options17, _this$options17$webAu, _this$options18, _this$options18$webAu, _this$options19, _this$options19$webAu, _this$options20, _this$options20$webAu, _this$options21, _this$options21$webAu;

    // must have a SESSION_SECRET so we can encrypt/decrypt the cookie
    if (!process.env.SESSION_SECRET) {
      throw new DbAuthError.NoSessionSecretError();
    } // must have an expiration time set for the session cookie


    if (((_this$options3 = this.options) === null || _this$options3 === void 0 ? void 0 : (_this$options3$login = _this$options3.login) === null || _this$options3$login === void 0 ? void 0 : _this$options3$login.enabled) !== false && !((_this$options4 = this.options) !== null && _this$options4 !== void 0 && (_this$options4$login = _this$options4.login) !== null && _this$options4$login !== void 0 && _this$options4$login.expires)) {
      throw new DbAuthError.NoSessionExpirationError();
    } // must have a login handler to actually log a user in


    if (((_this$options5 = this.options) === null || _this$options5 === void 0 ? void 0 : (_this$options5$login = _this$options5.login) === null || _this$options5$login === void 0 ? void 0 : _this$options5$login.enabled) !== false && !((_this$options6 = this.options) !== null && _this$options6 !== void 0 && (_this$options6$login = _this$options6.login) !== null && _this$options6$login !== void 0 && _this$options6$login.handler)) {
      throw new DbAuthError.NoLoginHandlerError();
    } // must have a signup handler to define how to create a new user


    if (((_this$options7 = this.options) === null || _this$options7 === void 0 ? void 0 : (_this$options7$signup = _this$options7.signup) === null || _this$options7$signup === void 0 ? void 0 : _this$options7$signup.enabled) !== false && !((_this$options8 = this.options) !== null && _this$options8 !== void 0 && (_this$options8$signup = _this$options8.signup) !== null && _this$options8$signup !== void 0 && _this$options8$signup.handler)) {
      throw new DbAuthError.NoSignupHandlerError();
    } // must have a forgot password handler to define how to notify user of reset token


    if (((_this$options9 = this.options) === null || _this$options9 === void 0 ? void 0 : (_this$options9$forgot = _this$options9.forgotPassword) === null || _this$options9$forgot === void 0 ? void 0 : _this$options9$forgot.enabled) !== false && !((_this$options10 = this.options) !== null && _this$options10 !== void 0 && (_this$options10$forgo = _this$options10.forgotPassword) !== null && _this$options10$forgo !== void 0 && _this$options10$forgo.handler)) {
      throw new DbAuthError.NoForgotPasswordHandlerError();
    } // must have a reset password handler to define what to do with user once password changed


    if (((_this$options11 = this.options) === null || _this$options11 === void 0 ? void 0 : (_this$options11$reset = _this$options11.resetPassword) === null || _this$options11$reset === void 0 ? void 0 : _this$options11$reset.enabled) !== false && !((_this$options12 = this.options) !== null && _this$options12 !== void 0 && (_this$options12$reset = _this$options12.resetPassword) !== null && _this$options12$reset !== void 0 && _this$options12$reset.handler)) {
      throw new DbAuthError.NoResetPasswordHandlerError();
    } // must have webAuthn config if credentialModelAccessor present and vice versa


    if ((_this$options13 = this.options) !== null && _this$options13 !== void 0 && _this$options13.credentialModelAccessor && !((_this$options14 = this.options) !== null && _this$options14 !== void 0 && _this$options14.webAuthn) || (_this$options15 = this.options) !== null && _this$options15 !== void 0 && _this$options15.webAuthn && !((_this$options16 = this.options) !== null && _this$options16 !== void 0 && _this$options16.credentialModelAccessor)) {
      throw new DbAuthError.NoWebAuthnConfigError();
    }

    if ((_this$options17 = this.options) !== null && _this$options17 !== void 0 && (_this$options17$webAu = _this$options17.webAuthn) !== null && _this$options17$webAu !== void 0 && _this$options17$webAu.enabled && (!((_this$options18 = this.options) !== null && _this$options18 !== void 0 && (_this$options18$webAu = _this$options18.webAuthn) !== null && _this$options18$webAu !== void 0 && _this$options18$webAu.name) || !((_this$options19 = this.options) !== null && _this$options19 !== void 0 && (_this$options19$webAu = _this$options19.webAuthn) !== null && _this$options19$webAu !== void 0 && _this$options19$webAu.domain) || !((_this$options20 = this.options) !== null && _this$options20 !== void 0 && (_this$options20$webAu = _this$options20.webAuthn) !== null && _this$options20$webAu !== void 0 && _this$options20$webAu.origin) || !((_this$options21 = this.options) !== null && _this$options21 !== void 0 && (_this$options21$webAu = _this$options21.webAuthn) !== null && _this$options21$webAu !== void 0 && _this$options21$webAu.credentialFields))) {
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
    const sanitized = JSON.parse(JSON.stringify(user));
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
    const cookieOptions = { ...this.options.cookie,
      ...options
    } || { ...options
    };
    const meta = Object.keys(cookieOptions).map(key => {
      const optionValue = cookieOptions[key]; // Convert the options to valid cookie string

      if (optionValue === true) {
        return key;
      } else if (optionValue === false) {
        return null;
      } else {
        return `${key}=${optionValue}`;
      }
    }).filter(v => v);
    const expiresAt = expires === 'now' ? DbAuthHandler.PAST_EXPIRES_DATE : expires;
    meta.push(`Expires=${expiresAt}`);
    return meta;
  } // encrypts a string with the SESSION_SECRET


  _encrypt(data) {
    return _cryptoJs.default.AES.encrypt(data, process.env.SESSION_SECRET);
  } // returns the set-cookie header to be returned in the request (effectively
  // creates the session)


  _createSessionHeader(data, csrfToken) {
    const session = JSON.stringify(data) + ';' + csrfToken;

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
      var _this$options$resetPa9, _this$options$resetPa10;

      throw new DbAuthError.ResetTokenInvalidError((_this$options$resetPa9 = this.options.resetPassword) === null || _this$options$resetPa9 === void 0 ? void 0 : (_this$options$resetPa10 = _this$options$resetPa9.errors) === null || _this$options$resetPa10 === void 0 ? void 0 : _this$options$resetPa10.resetTokenInvalid);
    } // token has expired


    if (user[this.options.authFields.resetTokenExpiresAt] < tokenExpires) {
      var _this$options$resetPa11, _this$options$resetPa12;

      await this._clearResetToken(user);
      throw new DbAuthError.ResetTokenExpiredError((_this$options$resetPa11 = this.options.resetPassword) === null || _this$options$resetPa11 === void 0 ? void 0 : (_this$options$resetPa12 = _this$options$resetPa11.errors) === null || _this$options$resetPa12 === void 0 ? void 0 : _this$options$resetPa12.resetTokenExpired);
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
    // do we have all the query params we need to check the user?
    if (!username || username.toString().trim() === '' || !password || password.toString().trim() === '') {
      var _this$options$login2, _this$options$login2$;

      throw new DbAuthError.UsernameAndPasswordRequiredError((_this$options$login2 = this.options.login) === null || _this$options$login2 === void 0 ? void 0 : (_this$options$login2$ = _this$options$login2.errors) === null || _this$options$login2$ === void 0 ? void 0 : _this$options$login2$.usernameOrPasswordMissing);
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
      var _this$options$login3, _this$options$login3$;

      throw new DbAuthError.UserNotFoundError(username, (_this$options$login3 = this.options.login) === null || _this$options$login3 === void 0 ? void 0 : (_this$options$login3$ = _this$options$login3.errors) === null || _this$options$login3$ === void 0 ? void 0 : _this$options$login3$.usernameNotFound);
    } // is password correct?


    const [hashedPassword, _salt] = this._hashPassword(password, user[this.options.authFields.salt]);

    if (hashedPassword === user[this.options.authFields.hashedPassword]) {
      return user;
    } else {
      var _this$options$login4, _this$options$login4$;

      throw new DbAuthError.IncorrectPasswordError(username, (_this$options$login4 = this.options.login) === null || _this$options$login4 === void 0 ? void 0 : (_this$options$login4$ = _this$options$login4.errors) === null || _this$options$login4$ === void 0 ? void 0 : _this$options$login4$.incorrectPassword);
    }
  } // gets the user from the database and returns only its ID


  async _getCurrentUser() {
    var _this$session, _this$options$webAuth2;

    if (!((_this$session = this.session) !== null && _this$session !== void 0 && _this$session.id)) {
      throw new DbAuthError.NotLoggedInError();
    }

    const select = {
      [this.options.authFields.id]: true,
      [this.options.authFields.username]: true
    };

    if ((_this$options$webAuth2 = this.options.webAuthn) !== null && _this$options$webAuth2 !== void 0 && _this$options$webAuth2.enabled && this.options.authFields.challenge) {
      select[this.options.authFields.challenge] = true;
    }

    let user;

    try {
      var _this$session2;

      user = await this.dbAccessor.findUnique({
        where: {
          [this.options.authFields.id]: (_this$session2 = this.session) === null || _this$session2 === void 0 ? void 0 : _this$session2.id
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
        var _this$options$signup2, _this$options$signup3;

        throw new DbAuthError.DuplicateUsernameError(username, (_this$options$signup2 = this.options.signup) === null || _this$options$signup2 === void 0 ? void 0 : (_this$options$signup3 = _this$options$signup2.errors) === null || _this$options$signup3 === void 0 ? void 0 : _this$options$signup3.usernameTaken);
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
    var _this$event$queryStri;

    // try getting it from the query string, /.redwood/functions/auth?method=[methodName]
    let methodName = (_this$event$queryStri = this.event.queryStringParameters) === null || _this$event$queryStri === void 0 ? void 0 : _this$event$queryStri.method;

    if (!DbAuthHandler.METHODS.includes(methodName) && this.params) {
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
    if (!value || value.trim() === '') {
      var _this$options$signup4, _this$options$signup5;

      throw new DbAuthError.FieldRequiredError(name, (_this$options$signup4 = this.options.signup) === null || _this$options$signup4 === void 0 ? void 0 : (_this$options$signup5 = _this$options$signup4.errors) === null || _this$options$signup5 === void 0 ? void 0 : _this$options$signup5.fieldMissing);
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
    return [response ? JSON.stringify(response) : '', { ...this._deleteSessionHeader
    }];
  }

  _ok(body, headers = {}, options = {
    statusCode: 200
  }) {
    return {
      statusCode: options.statusCode,
      body: typeof body === 'string' ? body : JSON.stringify(body),
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
      body: JSON.stringify({
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