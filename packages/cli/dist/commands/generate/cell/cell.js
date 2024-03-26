"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;
require("core-js/modules/es.array.push.js");
var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));
var _pascalcase = _interopRequireDefault(require("pascalcase"));
var _generate = require("@redwoodjs/internal/dist/generate/generate");
var _lib = require("../../../lib");
var _pluralHelpers = require("../../../lib/pluralHelpers");
var _rollback = require("../../../lib/rollback");
var _rwPluralize = require("../../../lib/rwPluralize");
var _schemaHelpers = require("../../../lib/schemaHelpers");
var _helpers = require("../helpers");
var _utils = require("./utils/utils");
const COMPONENT_SUFFIX = 'Cell';
const REDWOOD_WEB_PATH_NAME = 'components';
const files = async ({
  name,
  typescript,
  ...options
}) => {
  let cellName = (0, _helpers.removeGeneratorName)(name, 'cell');
  let idName = 'id';
  let idType,
    mockIdValues = [42, 43, 44],
    model = null;
  let templateNameSuffix = '';

  // Create a unique operation name.

  const shouldGenerateList = ((0, _pluralHelpers.isWordPluralizable)(cellName) ? (0, _rwPluralize.isPlural)(cellName) : options.list) || options.list;

  // needed for the singular cell GQL query find by id case
  try {
    model = await (0, _schemaHelpers.getSchema)((0, _pascalcase.default)((0, _rwPluralize.singularize)(cellName)));
    idName = (0, _utils.getIdName)(model);
    idType = (0, _utils.getIdType)(model);
    mockIdValues = idType === 'String' ? (0, _map.default)(mockIdValues).call(mockIdValues, value => `'${value}'`) : mockIdValues;
  } catch {
    // Eat error so that the destroy cell generator doesn't raise an error
    // when trying to find prisma query engine in test runs.

    // Assume id will be Int, otherwise generated cell will keep throwing
    idType = 'Int';
  }
  if (shouldGenerateList) {
    cellName = (0, _helpers.forcePluralizeWord)(cellName);
    templateNameSuffix = 'List';
    // override operationName so that its find_operationName
  }
  let operationName = options.query;
  if (operationName) {
    const userSpecifiedOperationNameIsUnique = await (0, _utils.operationNameIsUnique)(operationName);
    if (!userSpecifiedOperationNameIsUnique) {
      throw new Error(`Specified query name: "${operationName}" is not unique!`);
    }
  } else {
    operationName = await (0, _utils.uniqueOperationName)(cellName, {
      list: shouldGenerateList
    });
  }
  const extension = typescript ? '.tsx' : '.jsx';
  const cellFile = await (0, _helpers.templateForComponentFile)({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: `cell${templateNameSuffix}.tsx.template`,
    templateVars: {
      operationName,
      idName,
      idType
    }
  });
  const testFile = await (0, _helpers.templateForComponentFile)({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension: `.test${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: 'test.js.template'
  });
  const storiesFile = await (0, _helpers.templateForComponentFile)({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension: `.stories${extension}`,
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: 'stories.tsx.template'
  });
  const mockFile = await (0, _helpers.templateForComponentFile)({
    name: cellName,
    suffix: COMPONENT_SUFFIX,
    extension: typescript ? '.mock.ts' : '.mock.js',
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'cell',
    templatePath: `mock${templateNameSuffix}.js.template`,
    templateVars: {
      idName,
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
  }

  // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }
  return (0, _reduce.default)(files).call(files, async (accP, [outputPath, content]) => {
    const acc = await accP;
    const template = typescript ? content : await (0, _lib.transformTSToJS)(outputPath, content);
    return {
      [outputPath]: template,
      ...acc
    };
  }, _promise.default.resolve({}));
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
  optionsObj: {
    ..._helpers.yargsDefaults,
    list: {
      alias: 'l',
      default: false,
      description: 'Use when you want to generate a cell for a list of the model name.',
      type: 'boolean'
    },
    query: {
      default: '',
      description: 'Use to enforce a specific query name within the generated cell - must be unique.',
      type: 'string'
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
          const {
            errors
          } = await (0, _generate.generate)();
          for (const {
            message,
            error
          } of errors) {
            console.error(message);
            console.log();
            console.error(error);
            console.log();
          }
          (0, _rollback.addFunctionToRollback)(_generate.generate, true);
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