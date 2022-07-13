"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.webPackages = exports.notes = exports.config = exports.apiPackages = void 0;
// the lines that need to be added to App.{js,tsx}
const config = {
  imports: [`import { Magic } from 'magic-sdk'`],
  init: 'const m = new Magic(process.env.MAGICLINK_PUBLIC)',
  authProvider: {
    client: 'm',
    type: 'magicLink'
  }
}; // required packages to install

exports.config = config;
const webPackages = ['magic-sdk'];
exports.webPackages = webPackages;
const apiPackages = ['@magic-sdk/admin']; // any notes to print out when the job is done

exports.apiPackages = apiPackages;
const notes = ['To get your application keys, go to https://dashboard.magic.link/login ', 'Then navigate to the API keys add them to your .env config options.', 'See: https://redwoodjs.com/docs/authentication#for-magiclink'];
exports.notes = notes;