"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.webPackages = exports.notes = exports.config = exports.apiPackages = void 0;
// the lines that need to be added to App.{js,tsx}
const config = {
  imports: [`import { PublicClientApplication } from '@azure/msal-browser'`],
  init: `const azureActiveDirectoryClient = new PublicClientApplication({
    auth: {
      clientId: process.env.AZURE_ACTIVE_DIRECTORY_CLIENT_ID,
      authority: process.env.AZURE_ACTIVE_DIRECTORY_AUTHORITY,
      redirectUri: process.env.AZURE_ACTIVE_DIRECTORY_REDIRECT_URI,
      postLogoutRedirectUri: process.env.AZURE_ACTIVE_DIRECTORY_LOGOUT_REDIRECT_URI,
    },
  })`,
  authProvider: {
    client: 'azureActiveDirectoryClient',
    type: 'azureActiveDirectory'
  }
}; // required packages to install

exports.config = config;
const webPackages = ['@azure/msal-browser'];
exports.webPackages = webPackages;
const apiPackages = []; // any notes to print out when the job is done

exports.apiPackages = apiPackages;
const notes = ['You will need to create several environment variables with your Azure AD config options. Check out web/src/App.{js,tsx} for the variables you need to add.', '\n', 'RedwoodJS specific Documentation:', 'https://redwoodjs.com/docs/authentication#azure-ad', '\n', 'MSAL.js Documentation:', 'https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications'];
exports.notes = notes;