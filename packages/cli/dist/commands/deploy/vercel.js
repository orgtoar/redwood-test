"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.description = exports.command = exports.builder = void 0;
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _helpers = require("./helpers/helpers");
const command = exports.command = 'vercel [...commands]';
const description = exports.description = 'Build command for Vercel deploy';
const builder = yargs => (0, _helpers.deployBuilder)(yargs);
exports.builder = builder;
const handler = yargs => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'deploy vercel',
    build: yargs.build,
    prisma: yargs.prisma,
    dataMigrate: yargs.dataMigrate
  });
  (0, _helpers.deployHandler)(yargs);
};
exports.handler = handler;