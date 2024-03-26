"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.SQLITE_YAML = exports.RENDER_YAML = exports.RENDER_HEALTH_CHECK = exports.PROJECT_NAME = exports.POSTGRES_YAML = void 0;
var _path = _interopRequireDefault(require("path"));
var _lib = require("../../../../lib");
const PROJECT_NAME = exports.PROJECT_NAME = _path.default.basename((0, _lib.getPaths)().base);
const RENDER_YAML = database => {
  return `# Quick links to the docs:
# - Redwood on Render: https://render.com/docs/deploy-redwood
# - Render's Blueprint spec: https://render.com/docs/yaml-spec

services:
- name: ${PROJECT_NAME}-web
  type: web
  env: static
  buildCommand: corepack enable && yarn install && yarn rw deploy render web
  staticPublishPath: ./web/dist

  envVars:
  - key: SKIP_INSTALL_DEPS
    value: true

  routes:
  - type: rewrite
    source: /.redwood/functions/*
    # Replace \`destination\` here after your first deploy:
    #
    # \`\`\`
    # destination: https://my-redwood-project-api.onrender.com/*
    # \`\`\`
    destination: replace_with_api_url/*
  - type: rewrite
    source: /*
    destination: /200.html

- name: ${PROJECT_NAME}-api
  type: web
  plan: free
  env: node
  region: oregon
  buildCommand: corepack enable && yarn install && yarn rw build api
  startCommand: yarn rw deploy render api

  envVars:
${database}
`;
};
exports.RENDER_YAML = RENDER_YAML;
const POSTGRES_YAML = exports.POSTGRES_YAML = `\
  - key: DATABASE_URL
    fromDatabase:
      name: ${PROJECT_NAME}-db
      property: connectionString

databases:
  - name: ${PROJECT_NAME}-db
    region: oregon`;
const SQLITE_YAML = exports.SQLITE_YAML = `\
  - key: DATABASE_URL
    value: file:./data/sqlite.db
  disk:
    name: sqlite-data
    mountPath: /opt/render/project/src/api/db/data
    sizeGB: 1`;
const RENDER_HEALTH_CHECK = exports.RENDER_HEALTH_CHECK = `\
// render-health-check
export const handler = async () => {
  return {
    statusCode: 200,
  }
}
`;