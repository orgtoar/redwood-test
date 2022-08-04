"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

require("core-js/modules/esnext.async-iterator.map.js");

require("core-js/modules/esnext.iterator.map.js");

require("core-js/modules/esnext.async-iterator.reduce.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.reduce.js");

var _pascalcase = _interopRequireDefault(require("pascalcase"));

var _generate = require("@redwoodjs/internal/dist/generate/generate");

var _lib = require("../../../lib");

var _pluralHelpers = require("../../../lib/pluralHelpers");

var _rwPluralize = require("../../../lib/rwPluralize");

var _schemaHelpers = require("../../../lib/schemaHelpers");

var _generate2 = require("../../generate");

var _helpers = require("../helpers");

var _utils = require("./utils/utils");

const COMPONENT_SUFFIX = 'Cell';
const REDWOOD_WEB_PATH_NAME = 'components';

const files = async ({
  name,
  typescript: generateTypescript,
  ...options
}) => {
  let cellName = (0, _helpers.removeGeneratorName)(name, 'cell');
  let idType,
      mockIdValues = [42, 43, 44],
      model = null;
  let templateNameSuffix = ''; // Create a unique operation name.

  const shouldGenerateList = ((0, _pluralHelpers.isWordPluralizable)(cellName) ? (0, _rwPluralize.isPlural)(cellName) : options.list) || options.list; // needed for the singular cell GQL query find by id case

  try {
    model = await (0, _schemaHelpers.getSchema)((0, _pascalcase.default)((0, _rwPluralize.singularize)(cellName)));
    idType = (0, _utils.getIdType)(model);
    mockIdValues = idType === 'String' ? mockIdValues.map(value => `'${value}'`) : mockIdValues;
  } catch {
    // Eat error so that the destroy cell generator doesn't raise an error
    // when trying to find prisma query engine in test runs.
    // Assume id will be Int, otherwise generated cell will keep throwing
    idType = 'Int';
  }

  if (shouldGenerateList) {
    cellName = (0, _helpers.forcePluralizeWord)(cellName);
    templateNameSuffix = 'List'; // override operationName so that its find_operationName
  }

  const operationName = await (0, _utils.uniqueOperationName)(cellName, {
    list: shouldGenerateList
  });
  const cellFile = (0, _helpers.templateForComponentFile)({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension: generateTypescript ? '.tsx' : '.js',
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: `cell${templateNameSuffix}.tsx.template`,
    templateVars: {
      operationName,
      idType
    }
  });
  const testFile = (0, _helpers.templateForComponentFile)({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension: generateTypescript ? '.test.tsx' : '.test.js',
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: 'test.js.template'
  });
  const storiesFile = (0, _helpers.templateForComponentFile)({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension: generateTypescript ? '.stories.tsx' : '.stories.js',
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: 'stories.js.template'
  });
  const mockFile = (0, _helpers.templateForComponentFile)({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension: generateTypescript ? '.mock.ts' : '.mock.js',
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: `mock${templateNameSuffix}.js.template`,
    templateVars: {
      mockIdValues
    }
  });
  const files = [cellFile];

  if (options.stories) {
    files.push(storiesFile);
  }

  if (options.tests) {
    files.push(testFile);
  }

  if (options.stories || options.tests) {
    files.push(mockFile);
  } // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }


  return files.reduce((acc, [outputPath, content]) => {
    const template = generateTypescript ? content : (0, _lib.transformTSToJS)(outputPath, content);
    return {
      [outputPath]: template,
      ...acc
    };
  }, {});
};

exports.files = files;
const {
  command,
  description,
  builder,
  handler
} = (0, _helpers.createYargsForComponentGeneration)({
  componentName: 'cell',
  filesFn: files,
  optionsObj: { ..._generate2.yargsDefaults,
    list: {
      alias: 'l',
      default: false,
      description: 'Use when you want to generate a cell for a list of the model name.',
      type: 'boolean'
    }
  },
  includeAdditionalTasks: ({
    name: cellName
  }) => {
    return [{
      title: `Generating types ...`,
      task: async (_ctx, task) => {
        const queryFieldName = (0, _lib.nameVariants)((0, _helpers.removeGeneratorName)(cellName, 'cell')).camelName;
        const projectHasSdl = await (0, _utils.checkProjectForQueryField)(queryFieldName);

        if (projectHasSdl) {
          await (0, _generate.generate)();
        } else {
          task.skip(`Skipping type generation: no SDL defined for "${queryFieldName}". To generate types, run 'yarn rw g sdl ${queryFieldName}'.`);
        }
      }
    }];
  }
});
exports.handler = handler;
exports.builder = builder;
exports.description = description;
exports.command = command;