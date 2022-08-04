"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generatePrismaCommand = exports.generatePrismaClient = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _lib = require("../lib");

// helper used in Dev and Build commands
const skipTask = (schema = (0, _lib.getPaths)().api.dbSchema) => {
  if (!_fs.default.existsSync(schema)) {
    console.log(`Skipping database and Prisma client generation, no \`schema.prisma\` file found: \`${schema}\``);
    return true;
  }

  return false;
};

const generatePrismaCommand = schema => {
  if (skipTask(schema)) {
    return {};
  }

  return {
    cmd: `node "${require.resolve('prisma/build/index.js')}"`,
    args: ['generate', schema && `--schema="${schema}"`]
  };
};
/**
 * Conditionally generate the prisma client, skip if it already exists.
 */


exports.generatePrismaCommand = generatePrismaCommand;

const generatePrismaClient = async ({
  verbose = true,
  force = true,
  schema = (0, _lib.getPaths)().api.dbSchema
}) => {
  if (skipTask(schema)) {
    return;
  } // Do not generate the Prisma client if it exists.


  if (!force) {
    // The Prisma client throws if it is not generated.
    try {
      // Import the client from the redwood apps node_modules path.
      const {
        PrismaClient
      } = require(_path.default.join((0, _lib.getPaths)().base, 'node_modules/.prisma/client')); // eslint-disable-next-line


      new PrismaClient();
      return; // Client exists, so abort.
    } catch (e) {// Swallow your pain, and generate.
    }
  }

  return await (0, _lib.runCommandTask)([{
    title: 'Generating the Prisma client...',
    ...generatePrismaCommand(schema)
  }], {
    verbose
  });
};

exports.generatePrismaClient = generatePrismaClient;