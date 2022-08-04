"use strict";

// The `process.env.*` values are replaced by webpack at build time.
global.RWJS_API_GRAPHQL_URL = process.env.RWJS_API_GRAPHQL_URL;
global.RWJS_API_DBAUTH_URL = process.env.RWJS_API_DBAUTH_URL;
global.RWJS_API_URL = process.env.RWJS_API_URL;
global.__REDWOOD__APP_TITLE = process.env.__REDWOOD__APP_TITLE;