"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webPackages = exports.notes = exports.config = exports.apiPackages = void 0;
// the lines that need to be added to App.{js,tsx}
const config = {
  imports: [`import { OktaAuth } from '@okta/okta-auth-js'`],
  init: `const okta = new OktaAuth({
  issuer: process.env.OKTA_ISSUER,
  clientId: process.env.OKTA_CLIENT_ID,
  redirectUri: process.env.OKTA_REDIRECT_URI,
  pkce: true,
})`,
  authProvider: {
    client: 'okta',
    type: 'okta'
  }
}; // required packages to install

exports.config = config;
const webPackages = ['@okta/okta-auth-js'];
exports.webPackages = webPackages;
const apiPackages = ['@okta/jwt-verifier']; // any notes to print out when the job is done

exports.apiPackages = apiPackages;
const notes = [];
exports.notes = notes;