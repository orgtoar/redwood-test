"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webPackages = exports.notes = exports.config = exports.apiPackages = void 0;
// the lines that need to be added to App.{js,tsx}
const config = {
  imports: [`import GoTrue from 'gotrue-js'`],
  init: `const goTrueClient = new GoTrue({
  APIUrl: 'https://MYAPP.netlify.app/.netlify/identity',
  setCookie: true,
})`,
  authProvider: {
    client: 'goTrueClient',
    type: 'goTrue'
  }
}; // required packages to install

exports.config = config;
const webPackages = ['gotrue-js'];
exports.webPackages = webPackages;
const apiPackages = []; // any notes to print out when the job is done

exports.apiPackages = apiPackages;
const notes = ['You will need to enable Identity on your Netlify site and set APIUrl to your API endpoint in your GoTrue client config.', 'See: https://github.com/redwoodjs/redwood/blob/main/packages/auth/README.md#for-gotrue-js'];
exports.notes = notes;