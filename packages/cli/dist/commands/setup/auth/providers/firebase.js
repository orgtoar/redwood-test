"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webPackages = exports.notes = exports.config = exports.apiPackages = void 0;
// the lines that need to be added to App.{js,tsx}
const config = {
  imports: [`import { initializeApp, getApp, getApps } from 'firebase/app'`, `import * as firebaseAuth from '@firebase/auth'`],
  init: `const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,

  /** Optional config, may be needed, depending on how you use firebase
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  **/
}

const firebaseApp = ((config) => {
  const apps = getApps()
  if (!apps.length) {
    initializeApp(config)
  }
  return getApp()
})(firebaseConfig)

export const firebaseClient = {
  firebaseAuth,
  firebaseApp, // optional
}`,
  authProvider: {
    client: 'firebaseClient',
    type: 'firebase'
  }
}; // required packages to install

exports.config = config;
const webPackages = ['firebase'];
exports.webPackages = webPackages;
const apiPackages = ['firebase-admin']; // any notes to print out when the job is done

exports.apiPackages = apiPackages;
const notes = ['You will need to create several environment variables with your Firebase config options.', 'Check out web/src/App.{js,tsx} for the variables you need to add.', 'See: https://firebase.google.com/docs/web/setup#config-object'];
exports.notes = notes;