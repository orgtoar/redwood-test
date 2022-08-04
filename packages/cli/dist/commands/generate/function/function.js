"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

require("core-js/modules/esnext.async-iterator.for-each.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.for-each.js");

var _path = _interopRequireDefault(require("path"));

var _camelcase = _interopRequireDefault(require("camelcase"));

var _listr = _interopRequireDefault(require("listr"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _generate = require("../../generate");

var _helpers = require("../helpers");

const files = ({
  name,
  typescript: generateTypescript = false,
  tests: generateTests = true,
  ...rest
}) => {
  const extension = generateTypescript ? '.ts' : '.js';
  const functionName = (0, _camelcase.default)(name);
  const outputFiles = [];
  const functionFiles = (0, _helpers.templateForComponentFile)({
    name: functionName,
    componentName: functionName,
    extension,
    apiPathSection: 'functions',
    generator: 'function',
    templatePath: 'function.ts.template',
    templateVars: { ...rest
    },
    outputPath: _path.default.join((0, _lib.getPaths)().api.functions, functionName, `${functionName}${extension}`)
  });
  outputFiles.push(functionFiles);

  if (generateTests) {
    const testFile = (0, _helpers.templateForComponentFile)({
      name: functionName,
      componentName: functionName,
      extension,
      apiPathSection: 'functions',
      generator: 'function',
      templatePath: 'test.ts.template',
      templateVars: { ...rest
      },
      outputPath: _path.default.join((0, _lib.getPaths)().api.functions, functionName, `${functionName}.test${extension}`)
    });
    const scenarioFile = (0, _helpers.templateForComponentFile)({
      name: functionName,
      componentName: functionName,
      extension,
      apiPathSection: 'functions',
      generator: 'function',
      templatePath: 'scenarios.ts.template',
      templateVars: { ...rest
      },
      outputPath: _path.default.join((0, _lib.getPaths)().api.functions, functionName, `${functionName}.scenarios${extension}`)
    });
    outputFiles.push(testFile);
    outputFiles.push(scenarioFile);
  }

  return outputFiles.reduce((acc, [outputPath, content]) => {
    const template = generateTypescript ? content : (0, _lib.transformTSToJS)(outputPath, content);
    return {
      [outputPath]: template,
      ...acc
    };
  }, {});
};

exports.files = files;
const command = 'function <name>';
exports.command = command;
const description = 'Generate a Function'; // This could be built using createYargsForComponentGeneration;
// however, functions shouldn't have a `stories` option. createYargs...
// should be reversed to provide `yargsDefaults` as the default configuration
// and accept a configuration such as its CURRENT default to append onto a command.

exports.description = description;

const builder = yargs => {
  yargs.positional('name', {
    description: 'Name of the Function',
    type: 'string'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-function')}`); // Add default options, includes '--typescript', '--javascript', '--force', ...

  Object.entries(_generate.yargsDefaults).forEach(([option, config]) => {
    yargs.option(option, config);
  });
}; // This could be built using createYargsForComponentGeneration;
// however, we need to add a message after generating the function files


exports.builder = builder;

const handler = async ({
  name,
  force,
  ...rest
}) => {
  const tasks = new _listr.default([{
    title: 'Generating function files...',
    task: async () => {
      return (0, _lib.writeFilesTask)(files({
        name,
        ...rest
      }), {
        overwriteExisting: force
      });
    }
  }], {
    collapse: false,
    exitOnError: true
  });

  try {
    await tasks.run();
    console.info('');
    console.info(_colors.default.warning('⚠ Important:'));
    console.info('');
    console.info(_colors.default.bold('When deployed, a custom serverless function is an open API endpoint and ' + 'is your responsibility to secure appropriately.'));
    console.info('');
    console.info(`Please consult the ${(0, _terminalLink.default)('Serverless Function Considerations', 'https://redwoodjs.com/docs/serverless-functions#security-considerations')} in the RedwoodJS documentation for more information.`);
    console.info('');
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;