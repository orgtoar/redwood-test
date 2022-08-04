"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webPackages = exports.notes = exports.config = exports.apiPackages = void 0;
// the lines that need to be added to App.{js,tsx}
const config = {
  imports: [`import netlifyIdentity from 'netlify-identity-widget'`, `import { isBrowser } from '@redwoodjs/prerender/browserUtils'`],
  init: 'isBrowser && netlifyIdentity.init()',
  authProvider: {
    client: 'netlifyIdentity',
    type: 'netlify'
  }
}; // required packages to install

exports.config = config;
const webPackages = ['netlify-identity-widget'];
exports.webPackages = webPackages;
const apiPackages = []; // any notes to print out when the job is done

exports.apiPackages = apiPackages;
const notes = ['You will need to enable Identity on your Netlify site and configure the API endpoint.', 'See: https://github.com/netlify/netlify-identity-widget#localhost'];
exports.notes = notes;