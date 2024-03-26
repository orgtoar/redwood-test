"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));
var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));
var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));
require("core-js/modules/es.array.push.js");
var _path = _interopRequireDefault(require("path"));
var _camelcase = _interopRequireDefault(require("camelcase"));
var _listr = require("listr2");
var _terminalLink = _interopRequireDefault(require("terminal-link"));
var _cliHelpers = require("@redwoodjs/cli-helpers");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _rollback = require("../../../lib/rollback");
var _helpers = require("../helpers");
const files = async ({
  name,
  typescript: generateTypescript = false,
  tests: generateTests = true,
  ...rest
}) => {
  const extension = generateTypescript ? '.ts' : '.js';
  const functionName = (0, _camelcase.default)(name);
  const outputFiles = [];
  const functionFiles = await (0, _helpers.templateForComponentFile)({
    name: functionName,
    componentName: functionName,
    extension,
    apiPathSection: 'functions',
    generator: 'function',
    templatePath: 'function.ts.template',
    templateVars: {
      ...rest
    },
    outputPath: _path.default.join((0, _lib.getPaths)().api.functions, functionName, `${functionName}${extension}`)
  });
  outputFiles.push(functionFiles);
  if (generateTests) {
    const testFile = await (0, _helpers.templateForComponentFile)({
      name: functionName,
      componentName: functionName,
      extension,
      apiPathSection: 'functions',
      generator: 'function',
      templatePath: 'test.ts.template',
      templateVars: {
        ...rest
      },
      outputPath: _path.default.join((0, _lib.getPaths)().api.functions, functionName, `${functionName}.test${extension}`)
    });
    const scenarioFile = await (0, _helpers.templateForComponentFile)({
      name: functionName,
      componentName: functionName,
      extension,
      apiPathSection: 'functions',
      generator: 'function',
      templatePath: 'scenarios.ts.template',
      templateVars: {
        ...rest
      },
      outputPath: _path.default.join((0, _lib.getPaths)().api.functions, functionName, `${functionName}.scenarios${extension}`)
    });
    outputFiles.push(testFile);
    outputFiles.push(scenarioFile);
  }
  return (0, _reduce.default)(outputFiles).call(outputFiles, async (accP, [outputPath, content]) => {
    const acc = await accP;
    const template = generateTypescript ? content : await (0, _lib.transformTSToJS)(outputPath, content);
    return {
      [outputPath]: template,
      ...acc
    };
  }, _promise.default.resolve({}));
};
exports.files = files;
const command = exports.command = 'function <name>';
const description = exports.description = 'Generate a Function';

// This could be built using createYargsForComponentGeneration;
// however, functions shouldn't have a `stories` option. createYargs...
// should be reversed to provide `yargsDefaults` as the default configuration
// and accept a configuration such as its CURRENT default to append onto a command.
const builder = yargs => {
  var _context;
  yargs.positional('name', {
    description: 'Name of the Function',
    type: 'string'
  }).option('rollback', {
    description: 'Revert all generator actions if an error occurs',
    type: 'boolean',
    default: true
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-function')}`);

  // Add default options, includes '--typescript', '--javascript', '--force', ...
  (0, _forEach.default)(_context = (0, _entries.default)(_helpers.yargsDefaults)).call(_context, ([option, config]) => {
    yargs.option(option, config);
  });
};

// This could be built using createYargsForComponentGeneration;
// however, we need to add a message after generating the function files
exports.builder = builder;
const handler = async ({
  name,
  force,
  ...rest
}) => {
  (0, _cliHelpers.recordTelemetryAttributes)({
    command: 'generate function',
    force,
    rollback: rest.rollback
  });
  (0, _helpers.validateName)(name);
  const tasks = new _listr.Listr([{
    title: 'Generating function files...',
    task: async () => {
      return (0, _lib.writeFilesTask)(await files({
        name,
        ...rest
      }), {
        overwriteExisting: force
      });
    }
  }], {
    rendererOptions: {
      collapseSubtasks: false
    },
    exitOnError: true
  });
  try {
    if (rest.rollback && !force) {
      (0, _rollback.prepareForRollback)(tasks);
    }
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
    process.exit(e?.exitCode || 1);
  }
};
exports.handler = handler;