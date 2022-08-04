"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.webPackages = exports.notes = exports.config = exports.apiPackages = void 0;
// the lines that need to be added to App.{js,tsx}
const config = {
  imports: [`import { createClient } from '@supabase/supabase-js'`],
  init: `const supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  )`,
  authProvider: {
    client: 'supabaseClient',
    type: 'supabase'
  }
}; // required packages to install

exports.config = config;
const webPackages = ['@supabase/supabase-js'];
exports.webPackages = webPackages;
const apiPackages = []; // any notes to print out when the job is done

exports.apiPackages = apiPackages;
const notes = ['You will need to add your Supabase URL (SUPABASE_URL), public API KEY, and JWT SECRET (SUPABASE_KEY, and SUPABASE_JWT_SECRET) to your .env file.', 'See: https://supabase.io/docs/library/getting-started#reference'];
exports.notes = notes;