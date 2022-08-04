"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webPackages = exports.notes = exports.config = exports.apiPackages = void 0;
// the lines that need to be added to App.{js,tsx}
const config = {
  imports: [`import { NhostClient } from '@nhost/nhost-js'`],
  init: `const nhostClient = new NhostClient({
  backendUrl: process.env.NHOST_BACKEND_URL,
});
`,
  authProvider: {
    client: 'nhostClient',
    type: 'nhost'
  }
}; // required packages to install

exports.config = config;
const webPackages = ['@nhost/nhost-js'];
exports.webPackages = webPackages;
const apiPackages = []; // any notes to print out when the job is done

exports.apiPackages = apiPackages;
const notes = ["You will need to add your project's backend URL (NHOST_BACKEND_URL) and JWT Key Secret (NHOST_JWT_SECRET) to your .env file."];
exports.notes = notes;