"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SQLITE_YAML = exports.RENDER_YAML = exports.RENDER_HEALTH_CHECK = exports.PROJECT_NAME = exports.POSTGRES_YAML = void 0;

var _path = _interopRequireDefault(require("path"));

var _lib = require("../../../../lib");

const PROJECT_NAME = _path.default.basename((0, _lib.getPaths)().base);

exports.PROJECT_NAME = PROJECT_NAME;

const RENDER_YAML = database => {
  return `#####
# Documentation
# Redwood: https://render.com/docs/deploy-redwood
# YAML (all config values): https://render.com/docs/yaml-spec
#####

services:
- name: ${PROJECT_NAME}-web
  type: web
  env: static
  buildCommand: yarn rw deploy render web
  staticPublishPath: ./web/dist
  envVars:
  - key: NODE_VERSION
    value: 16
  routes:
  - type: rewrite
    source: /.redwood/functions/*
#####
# NOTE: replace destination api url after first deploy to Render
# example:
#   destination: https://myredwoodproject-api.onrender.com/*
#####
    destination: replace_with_api_url/*
  - type: rewrite
    source: /*
    destination: /index.html

- name: ${PROJECT_NAME}-api
  type: web
  env: node
  region: oregon
  buildCommand: yarn && yarn rw build api
  startCommand: yarn rw deploy render api
  envVars:
  - key: NODE_VERSION
    value: 16
${database}
`;
};

exports.RENDER_YAML = RENDER_YAML;
const POSTGRES_YAML = `  - key: DATABASE_URL
    fromDatabase:
      name: ${PROJECT_NAME}-db
      property: connectionString

databases:
  - name: ${PROJECT_NAME}-db
    region: oregon
`;
exports.POSTGRES_YAML = POSTGRES_YAML;
const SQLITE_YAML = `  - key: DATABASE_URL
    value: file:./data/sqlite.db
  disk:
    name: sqlite-data
    mountPath: /opt/render/project/src/api/db/data
    sizeGB: 1`;
exports.SQLITE_YAML = SQLITE_YAML;
const RENDER_HEALTH_CHECK = `// render-health-check
export const handler = async () => {
  return {
    statusCode: 200,
  }
}`;
exports.RENDER_HEALTH_CHECK = RENDER_HEALTH_CHECK;