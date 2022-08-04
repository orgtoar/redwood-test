"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _path = _interopRequireDefault(require("path"));

var _camelcase = _interopRequireDefault(require("camelcase"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _prompts = _interopRequireDefault(require("prompts"));

var _config = require("@redwoodjs/internal/dist/config");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _generate = require("../../generate");

var _helpers = require("../helpers");

const files = ({
  name,
  typescript = false,
  type,
  tests
}) => {
  if (tests === undefined) {
    tests = (0, _config.getConfig)().generate.tests;
  }

  if (!type) {
    throw new Error('You must specify a directive type');
  }

  const camelName = (0, _camelcase.default)(name);
  const outputFilename = `${camelName}.${typescript ? 'ts' : 'js'}`;
  const directiveFile = (0, _helpers.templateForComponentFile)({
    name,
    extension: typescript ? '.ts' : '.js',
    generator: 'directive',
    templatePath: `${type}.directive.ts.template`,
    outputPath: _path.default.join((0, _lib.getPaths)().api.directives, camelName, outputFilename),
    templateVars: {
      camelName
    }
  });
  const files = [directiveFile];

  if (tests) {
    const testOutputFilename = `${(0, _camelcase.default)(name)}.test.${typescript ? 'ts' : 'js'}`;
    const testFile = (0, _helpers.templateForComponentFile)({
      name,
      extension: typescript ? '.test.ts' : '.test.js',
      generator: 'directive',
      templatePath: `${type}.directive.test.ts.template`,
      outputPath: _path.default.join((0, _lib.getPaths)().api.directives, camelName, testOutputFilename),
      templateVars: {
        camelName
      }
    });
    files.push(testFile);
  } // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }


  return (0, _reduce.default)(files).call(files, (acc, [outputPath, content]) => {
    const template = typescript ? content : (0, _lib.transformTSToJS)(outputPath, content);
    return {
      [outputPath]: template,
      ...acc
    };
  }, {});
};

exports.files = files;
const positionalsObj = {
  name: {
    description: 'Name of your directive',
    type: 'string'
  }
};
const {
  command,
  description,
  builder
} = (0, _helpers.createYargsForComponentGeneration)({
  componentName: 'directive',
  filesFn: files,
  positionalsObj,
  optionsObj: { ..._generate.yargsDefaults,
    type: {
      type: 'string',
      choices: ['validator', 'transformer'],
      description: 'Whether to generate a validator or transformer directive'
    }
  }
});
exports.builder = builder;
exports.description = description;
exports.command = command;

const handler = async args => {
  var _context;

  const POST_RUN_INSTRUCTIONS = `Next steps...\n\n   ${_colors.default.warning('After modifying your directive, you can add it to your SDLs e.g.:')}
    ${_colors.default.info('// example todo.sdl.js')}
    ${_colors.default.info('# Option A: Add it to a field')}
    type Todo {
      id: Int!
      body: String! ${_colors.default.green(`@${args.name}`)}
    }

    ${_colors.default.info('# Option B: Add it to query/mutation')}
    type Query {
      todos: [Todo] ${_colors.default.green(`@${args.name}`)}
    }
`;
  let directiveType = args.type; // Prompt to select what type if not specified

  if (!directiveType) {
    const response = await (0, _prompts.default)({
      type: 'select',
      name: 'directiveType',
      choices: [{
        value: 'validator',
        title: 'Validator',
        description: 'Implement a validation: throw an error if criteria not met to stop execution'
      }, {
        value: 'transformer',
        title: 'Transformer',
        description: 'Modify values of fields or query responses'
      }],
      message: 'What type of directive would you like to generate?'
    });
    directiveType = response.directiveType;
  }

  const tasks = new _listr.default((0, _filter.default)(_context = [{
    title: 'Generating directive file ...',
    task: () => {
      return (0, _lib.writeFilesTask)(files({ ...args,
        type: directiveType
      }), {
        overwriteExisting: args.force
      });
    }
  }, {
    title: 'Generating TypeScript definitions and GraphQL schemas ...',
    task: () => {
      return (0, _execa.default)('yarn rw-gen', [], {
        stdio: 'pipe',
        shell: true
      });
    }
  }, {
    title: 'Next steps...',
    task: (_ctx, task) => {
      task.title = POST_RUN_INSTRUCTIONS;
    }
  }]).call(_context, Boolean), {
    collapse: false
  });

  try {
    await tasks.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
    process.exit(1);
  }
};

exports.handler = handler;