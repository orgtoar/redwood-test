"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.postgresDatabaseService = exports.mysqlDatabaseService = exports.flightcontrolConfig = exports.databaseEnvVariables = void 0;
const flightcontrolConfig = exports.flightcontrolConfig = {
  $schema: 'https://app.flightcontrol.dev/schema.json',
  environments: [{
    id: 'development',
    name: 'Development',
    region: 'us-east-1',
    source: {
      branch: 'main'
    },
    services: [{
      id: 'redwood-api',
      name: 'Redwood API',
      type: 'fargate',
      buildType: 'nixpacks',
      cpu: 0.5,
      memory: 1,
      installCommand: 'corepack enable && yarn install',
      buildCommand: 'yarn rw deploy flightcontrol api',
      startCommand: 'yarn rw deploy flightcontrol api --serve',
      port: 8911,
      healthCheckPath: '/graphql/health',
      envVariables: {
        REDWOOD_WEB_URL: {
          fromService: {
            id: 'redwood-web',
            value: 'origin'
          }
        }
      }
    }, {
      id: 'redwood-web',
      name: 'Redwood Web',
      type: 'static',
      buildType: 'nixpacks',
      singlePageApp: true,
      installCommand: 'corepack enable && yarn install',
      buildCommand: 'yarn rw deploy flightcontrol web',
      outputDirectory: 'web/dist',
      envVariables: {
        REDWOOD_API_URL: {
          fromService: {
            id: 'redwood-api',
            value: 'origin'
          }
        }
      }
    }]
  }]
};
const postgresDatabaseService = exports.postgresDatabaseService = {
  id: 'db',
  name: 'Database',
  type: 'rds',
  engine: 'postgres',
  engineVersion: '12',
  instanceSize: 'db.t2.micro',
  port: 5432,
  storage: 20,
  private: false
};
const mysqlDatabaseService = exports.mysqlDatabaseService = {
  id: 'db',
  name: 'Mysql',
  type: 'rds',
  engine: 'mysql',
  engineVersion: '8',
  instanceSize: 'db.t2.micro',
  port: 3306,
  storage: 20,
  private: false
};
const databaseEnvVariables = exports.databaseEnvVariables = {
  DATABASE_URL: {
    fromService: {
      id: 'db',
      value: 'dbConnectionString'
    }
  }
};