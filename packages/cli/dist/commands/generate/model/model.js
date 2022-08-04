"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _schemaHelpers = require("../../../lib/schemaHelpers");

var _generate = require("../../generate");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const TEMPLATE_PATH = _path.default.resolve(__dirname, 'templates', 'model.js.template');

const files = ({
  name,
  typescript = false
}) => {
  const outputFilename = `${name}.${typescript ? 'ts' : 'js'}`;

  const outputPath = _path.default.join((0, _lib.getPaths)().api.models, outputFilename);

  return {
    [outputPath]: (0, _lib.generateTemplate)(TEMPLATE_PATH, {
      name
    })
  };
};

exports.files = files;
const command = 'model <name>';
exports.command = command;
const description = 'Generate a RedwoodRecord model';
exports.description = description;

const builder = yargs => {
  yargs.positional('name', {
    description: 'Name of the model to create',
    type: 'string'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('RedwoodRecord Reference', 'https://redwoodjs.com/docs/redwoodrecord')}`);
  Object.entries(_generate.yargsDefaults).forEach(([option, config]) => {
    yargs.option(option, config);
  });
};

exports.builder = builder;

const handler = async ({
  force,
  ...args
}) => {
  const tasks = new _listr.default([{
    title: 'Generating model file...',
    task: () => {
      return (0, _lib.writeFilesTask)(files(args), {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Parsing datamodel, generating api/src/models/index.js...',
    task: async () => {
      const {
        parseDatamodel
      } = await Promise.resolve().then(() => _interopRequireWildcard(require('@redwoodjs/record')));
      await parseDatamodel();
    }
  }].filter(Boolean), {
    collapse: false
  });

  try {
    await (0, _schemaHelpers.verifyModelName)({
      name: args.name
    });
    await tasks.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
    process.exit(1);
  }
};

exports.handler = handler;