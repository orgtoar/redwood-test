"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routes = exports.paramVariants = exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

require("core-js/modules/esnext.async-iterator.reduce.js");

require("core-js/modules/esnext.iterator.constructor.js");

require("core-js/modules/esnext.iterator.reduce.js");

require("core-js/modules/esnext.async-iterator.filter.js");

require("core-js/modules/esnext.iterator.filter.js");

var _child_process = require("child_process");

var _camelcase = _interopRequireDefault(require("camelcase"));

var _listr = _interopRequireDefault(require("listr"));

var _pascalcase = _interopRequireDefault(require("pascalcase"));

var _config = require("@redwoodjs/internal/dist/config");

var _generate = require("@redwoodjs/internal/dist/generate/generate");

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _helpers = require("../helpers");

const COMPONENT_SUFFIX = 'Page';
const REDWOOD_WEB_PATH_NAME = 'pages';
/** @type {(paramType: 'Int' | 'Boolean' | 'String') } **/

const mapRouteParamTypeToDefaultValue = paramType => {
  switch (paramType) {
    case 'Int':
      // "42" is just a value used for demonstrating parameter usage in the
      // generated page-, test-, and story-files.
      return 42;

    case 'Float':
      return 42.1;

    case 'Boolean':
      return true;

    default:
      // Boolean -> boolean, String -> string
      return '42';
  }
};

const paramVariants = path => {
  var _path$match;

  const param = path === null || path === void 0 ? void 0 : (_path$match = path.match(/(\{[\w:]+\})/)) === null || _path$match === void 0 ? void 0 : _path$match[1];
  const paramName = param === null || param === void 0 ? void 0 : param.replace(/:[^}]+/, '').slice(1, -1);

  if (param === undefined) {
    return {
      propParam: '',
      propValueParam: '',
      argumentParam: '',
      paramName: '',
      paramValue: '',
      paramType: ''
    };
  } // set paramType param includes type (e.g. {id:Int}), else use string


  const routeParamType = param !== null && param !== void 0 && param.match(/:/) ? param === null || param === void 0 ? void 0 : param.replace(/[^:]+/, '').slice(1, -1) : 'String';
  const defaultValue = mapRouteParamTypeToDefaultValue(routeParamType);
  const defaultValueAsProp = routeParamType === 'String' ? `'${defaultValue}'` : defaultValue;
  return {
    propParam: `{ ${paramName} }`,
    propValueParam: `${paramName}={${defaultValueAsProp}} `,
    // used in story
    argumentParam: `{ ${paramName}: ${defaultValueAsProp} }`,
    paramName,
    paramValue: defaultValue,
    paramType: (0, _helpers.mapRouteParamTypeToTsType)(routeParamType)
  };
};

exports.paramVariants = paramVariants;

const files = ({
  name,
  tests,
  stories,
  typescript,
  ...rest
}) => {
  const pageFile = (0, _helpers.templateForComponentFile)({
    name,
    suffix: COMPONENT_SUFFIX,
    extension: typescript ? '.tsx' : '.js',
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'page',
    templatePath: 'page.tsx.template',
    templateVars: rest
  });
  const testFile = (0, _helpers.templateForComponentFile)({
    name,
    suffix: COMPONENT_SUFFIX,
    extension: typescript ? '.test.tsx' : '.test.js',
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'page',
    templatePath: 'test.tsx.template',
    templateVars: rest
  });
  const storiesFile = (0, _helpers.templateForComponentFile)({
    name,
    suffix: COMPONENT_SUFFIX,
    extension: typescript ? '.stories.tsx' : '.stories.js',
    webPathSection: REDWOOD_WEB_PATH_NAME,
    generator: 'page',
    templatePath: 'stories.tsx.template',
    templateVars: rest
  });
  const files = [pageFile];

  if (tests) {
    files.push(testFile);
  }

  if (stories) {
    files.push(storiesFile);
  } // Returns
  // {
  //    "path/to/fileA": "<<<template>>>",
  //    "path/to/fileB": "<<<template>>>",
  // }


  return files.reduce((acc, [outputPath, content]) => {
    const template = typescript ? content : (0, _lib.transformTSToJS)(outputPath, content);
    return {
      [outputPath]: template,
      ...acc
    };
  }, {});
};

exports.files = files;

const routes = ({
  name,
  path
}) => {
  return [`<Route path="${path}" page={${(0, _pascalcase.default)(name)}Page} name="${(0, _camelcase.default)(name)}" />`];
};

exports.routes = routes;
const positionalsObj = {
  path: {
    description: 'URL path to the page, or just {param}. Defaults to name',
    type: 'string'
  }
}; // @NOTE: Not exporting handler from function
// As pages need a special handler

const {
  command,
  description,
  builder
} = (0, _helpers.createYargsForComponentGeneration)({
  componentName: 'page',
  positionalsObj
});
exports.builder = builder;
exports.description = description;
exports.command = command;

const handler = async ({
  name,
  path,
  force,
  tests,
  stories,
  typescript = false
}) => {
  const pageName = (0, _helpers.removeGeneratorName)(name, 'page');

  if (tests === undefined) {
    tests = (0, _config.getConfig)().generate.tests;
  }

  if (stories === undefined) {
    stories = (0, _config.getConfig)().generate.stories;
  }

  if (process.platform === 'win32') {
    // running `yarn rw g page home /` on Windows using GitBash
    // POSIX-to-Windows path conversion will kick in.
    // See https://github.com/git-for-windows/build-extra/blob/d715c9e/ReleaseNotes.md
    // As a workaround we try to detect when this has happened, and reverse
    // the action
    try {
      // `cygpath -m /` will return something like 'C:/Program Files/Git/\n'
      const slashPath = (0, _child_process.execSync)('cygpath -m /', {
        stdio: ['ignore', 'pipe', 'ignore']
      }).toString().trim(); // `yarn rw g page home /` =>
      //   page === 'C:/Program Files/Git'
      // `yarn rw g page about /about` =>
      //   page === 'C:/Program Files/Git/about'
      // Sometimes there is a / after 'Git' to match, sometimes there isn't

      path = path.replace(new RegExp(`^${slashPath}?`), '/');
    } catch {// probably using PowerShell or cmd, in which case no special handling
      // is needed
    }
  }

  const tasks = new _listr.default([{
    title: 'Generating page files...',
    task: async () => {
      path = (0, _helpers.pathName)(path, pageName);
      const f = await files({
        name: pageName,
        path,
        tests,
        stories,
        typescript,
        ...paramVariants(path)
      });
      return (0, _lib.writeFilesTask)(f, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Updating routes file...',
    task: async () => {
      (0, _lib.addRoutesToRouterTask)(routes({
        name: pageName,
        path: (0, _helpers.pathName)(path, pageName)
      }));
    }
  }, {
    title: `Generating types...`,
    task: _generate.generate
  }, {
    title: 'One more thing...',
    task: (ctx, task) => {
      task.title = `One more thing...\n\n` + `   ${_colors.default.warning('Page created! A note about <MetaTags>:')}\n\n` + `   At the top of your newly created page is a <MetaTags> component,\n` + `   which contains the title and description for your page, essential\n` + `   to good SEO. Check out this page for best practices: \n\n` + `   https://developers.google.com/search/docs/advanced/appearance/good-titles-snippets\n`;
    }
  }].filter(Boolean), {
    collapse: false
  });

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.exitCode) || 1);
  }
};

exports.handler = handler;