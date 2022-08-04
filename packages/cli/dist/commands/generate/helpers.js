"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.relationsForModel = exports.pathName = exports.mapRouteParamTypeToTsType = exports.mapPrismaScalarToPagePropTsType = exports.intForeignKeysForModel = exports.forcePluralizeWord = exports.customOrDefaultTemplatePath = exports.createYargsForComponentGeneration = void 0;
exports.removeGeneratorName = removeGeneratorName;
exports.templateForComponentFile = void 0;

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/starts-with"));

var _endsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/ends-with"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/entries"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _listr = _interopRequireDefault(require("listr"));

var _listrVerboseRenderer = _interopRequireDefault(require("listr-verbose-renderer"));

var _paramCase = require("param-case");

var _pascalcase = _interopRequireDefault(require("pascalcase"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _config = require("@redwoodjs/internal/dist/config");

var _paths = require("@redwoodjs/internal/dist/paths");

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../lib");

var _colors = _interopRequireDefault(require("../../lib/colors"));

var _rwPluralize = require("../../lib/rwPluralize");

var _generate = require("../generate");

/**
 * Returns the path to a custom generator template, if found in the app.
 * Otherwise the default Redwood template.
 */
const customOrDefaultTemplatePath = ({
  side,
  generator,
  templatePath
}) => {
  // default template for this generator: ./page/templates/page.tsx.template
  const defaultPath = _path.default.join(__dirname, generator, 'templates', templatePath); // where a custom template *might* exist: /path/to/app/web/generators/page/page.tsx.template


  const customPath = _path.default.join((0, _lib.getPaths)()[side].generators, generator, templatePath);

  if (_fs.default.existsSync(customPath)) {
    return customPath;
  } else {
    return defaultPath;
  }
};
/**
 * Reduces boilerplate for generating an output path and content to write to disk
 * for a component.
 */
// TODO: Make this read all the files in a template directory instead of
// manually passing in each file.


exports.customOrDefaultTemplatePath = customOrDefaultTemplatePath;

const templateForComponentFile = ({
  name,
  suffix = '',
  extension = '.js',
  webPathSection,
  apiPathSection,
  generator,
  templatePath,
  templateVars,
  componentName,
  outputPath
}) => {
  const basePath = webPathSection ? (0, _lib.getPaths)().web[webPathSection] : (0, _lib.getPaths)().api[apiPathSection];
  const outputComponentName = componentName || (0, _pascalcase.default)(name) + suffix;

  const componentOutputPath = outputPath || _path.default.join(basePath, outputComponentName, outputComponentName + extension);

  const fullTemplatePath = customOrDefaultTemplatePath({
    generator,
    templatePath,
    side: webPathSection ? 'web' : 'api'
  });
  const content = (0, _lib.generateTemplate)(fullTemplatePath, {
    name,
    outputPath: (0, _paths.ensurePosixPath)(`./${_path.default.relative((0, _lib.getPaths)().base, componentOutputPath)}`),
    ...templateVars
  });
  return [componentOutputPath, content];
};
/**
 * Creates a route path, either returning the existing path if passed, or
 * creating one based on the name. If the passed path is just a route parameter
 * a new path based on the name is created, with the parameter appended to it
 */


exports.templateForComponentFile = templateForComponentFile;

const pathName = (path, name) => {
  let routePath = path;

  if (path && (0, _startsWith.default)(path).call(path, '{') && (0, _endsWith.default)(path).call(path, '}')) {
    routePath = `/${(0, _paramCase.paramCase)(name)}/${path}`;
  }

  if (!routePath) {
    routePath = `/${(0, _paramCase.paramCase)(name)}`;
  }

  return routePath;
};

exports.pathName = pathName;

const appendPositionalsToCmd = (commandString, positionalsObj) => {
  // Add positionals like `page <name>` + ` [path]` if specified
  if ((0, _keys.default)(positionalsObj).length > 0) {
    var _context;

    const positionalNames = (0, _map.default)(_context = (0, _keys.default)(positionalsObj)).call(_context, positionalName => `[${positionalName}]`).join(' '); // Note space after command is important

    return `${commandString} ${positionalNames}`;
  } else {
    return commandString;
  }
};
/** @type {(name: string, generatorName: string) => string } **/


function removeGeneratorName(name, generatorName) {
  // page -> Page
  const pascalComponentName = (0, _pascalcase.default)(generatorName); // Replace 'Page' at the end of `name` with ''

  const coercedName = name.replace(new RegExp(pascalComponentName + '$'), '');
  return coercedName;
}
/**
 * Reduces boilerplate for creating a yargs handler that writes a
 * component/page/layout/etc to a location.
 */


const createYargsForComponentGeneration = ({
  componentName,
  preTasksFn = options => options,

  /** filesFn is not used if generator implements its own `handler` */
  filesFn = () => ({}),
  optionsObj = _generate.yargsDefaults,
  positionalsObj = {},

  /** function that takes the options object and returns an array of listr tasks */
  includeAdditionalTasks = () => []
}) => {
  return {
    command: appendPositionalsToCmd(`${componentName} <name>`, positionalsObj),
    description: `Generate a ${componentName} component`,
    builder: yargs => {
      var _context2, _context3;

      yargs.positional('name', {
        description: `Name of the ${componentName}`,
        type: 'string'
      }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', `https://redwoodjs.com/docs/cli-commands#generate-${componentName}`)}`).option('tests', {
        description: 'Generate test files',
        type: 'boolean'
      }).option('stories', {
        description: 'Generate storybook files',
        type: 'boolean'
      }).option('verbose', {
        description: 'Print all logs',
        type: 'boolean',
        default: false
      }); // Add in passed in positionals

      (0, _forEach.default)(_context2 = (0, _entries.default)(positionalsObj)).call(_context2, ([option, config]) => {
        yargs.positional(option, config);
      }); // Add in passed in options

      (0, _forEach.default)(_context3 = (0, _entries.default)(optionsObj)).call(_context3, ([option, config]) => {
        yargs.option(option, config);
      });
    },
    handler: async options => {
      if (options.tests === undefined) {
        options.tests = (0, _config.getConfig)().generate.tests;
      }

      if (options.stories === undefined) {
        options.stories = (0, _config.getConfig)().generate.stories;
      }

      try {
        options = await preTasksFn(options);
        const tasks = new _listr.default([{
          title: `Generating ${componentName} files...`,
          task: async () => {
            const f = await filesFn(options);
            return (0, _lib.writeFilesTask)(f, {
              overwriteExisting: options.force
            });
          }
        }, ...includeAdditionalTasks(options)], {
          collapse: false,
          exitOnError: true,
          renderer: options.verbose && _listrVerboseRenderer.default
        });
        await tasks.run();
      } catch (e) {
        (0, _telemetry.errorTelemetry)(process.argv, e.message);
        console.error(_colors.default.error(e.message));
        process.exit(e?.exitCode || 1);
      }
    }
  };
}; // Returns all relations to other models


exports.createYargsForComponentGeneration = createYargsForComponentGeneration;

const relationsForModel = model => {
  var _context4, _context5;

  return (0, _map.default)(_context4 = (0, _filter.default)(_context5 = model.fields).call(_context5, f => f.relationName)).call(_context4, field => {
    return field.name;
  });
}; // Returns only relations that are of datatype Int


exports.relationsForModel = relationsForModel;

const intForeignKeysForModel = model => {
  var _context6, _context7;

  return (0, _map.default)(_context6 = (0, _filter.default)(_context7 = model.fields).call(_context7, f => f.name.match(/Id$/) && f.type === 'Int')).call(_context6, f => f.name);
};
/**
 * Adds "List" to the end of words we can't pluralize
 */


exports.intForeignKeysForModel = intForeignKeysForModel;

const forcePluralizeWord = word => {
  // If word is both plural and singular (like equipment), then append "List"
  if ((0, _rwPluralize.isPlural)(word) && (0, _rwPluralize.isSingular)(word)) {
    return (0, _pascalcase.default)(`${word}_list`);
  }

  return (0, _rwPluralize.pluralize)(word);
};
/** @type {(paramType: 'Int' | 'Float' | 'Boolean' | 'String') => string } **/


exports.forcePluralizeWord = forcePluralizeWord;

const mapRouteParamTypeToTsType = paramType => {
  const routeParamToTsType = {
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    String: 'string'
  };
  return routeParamToTsType[paramType] || 'unknown';
};
/** @type {(scalarType: 'String' | 'Boolean' | 'Int' | 'BigInt' | 'Float' | 'Decimal' | 'DateTime' ) => string } **/


exports.mapRouteParamTypeToTsType = mapRouteParamTypeToTsType;

const mapPrismaScalarToPagePropTsType = scalarType => {
  const prismaScalarToTsType = {
    String: 'string',
    Boolean: 'boolean',
    Int: 'number',
    BigInt: 'number',
    Float: 'number',
    Decimal: 'number',
    DateTime: 'string'
  };
  return prismaScalarToTsType[scalarType] || 'unknown';
};

exports.mapPrismaScalarToPagePropTsType = mapPrismaScalarToPagePropTsType;