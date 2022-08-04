"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tasks = exports.splitPathAndModel = exports.shouldUseTailwindCSS = exports.routes = exports.handler = exports.files = exports.description = exports.command = exports.builder = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _camelcase = _interopRequireDefault(require("camelcase"));

var _humanizeString = _interopRequireDefault(require("humanize-string"));

var _listr = _interopRequireDefault(require("listr"));

var _paramCase = require("param-case");

var _pascalcase = _interopRequireDefault(require("pascalcase"));

var _terminalLink = _interopRequireDefault(require("terminal-link"));

var _config = require("@redwoodjs/internal/dist/config");

var _generate = require("@redwoodjs/internal/dist/generate/generate");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _rwPluralize = require("../../../lib/rwPluralize");

var _schemaHelpers = require("../../../lib/schemaHelpers");

var _generate2 = require("../../generate");

var _helpers = require("../helpers");

var _sdl = require("../sdl/sdl");

var _service = require("../service/service");

// note a better way to do this is in https://github.com/redwoodjs/redwood/pull/3783/files
const NON_EDITABLE_COLUMNS = ['id', 'createdAt', 'updatedAt']; // Any assets that should not trigger an overwrite error and require a --force

const SKIPPABLE_ASSETS = ['scaffold.css'];
const PACKAGE_SET = 'Set';

const getIdType = model => {
  var _model$fields$find;

  return (_model$fields$find = model.fields.find(field => field.isId)) === null || _model$fields$find === void 0 ? void 0 : _model$fields$find.type;
};

const filterAutoGeneratedColumnsForScaffold = column => {
  var _column$default;

  const autoGeneratedFunctions = ['now', 'autoincrement'];
  return !(column.isId || column.isUpdatedAt || autoGeneratedFunctions.includes(column === null || column === void 0 ? void 0 : (_column$default = column.default) === null || _column$default === void 0 ? void 0 : _column$default.name));
};

const getImportComponentNames = (name, scaffoldPath, nestScaffoldByModel = true) => {
  const pluralName = (0, _pascalcase.default)((0, _rwPluralize.pluralize)(name));
  const singularName = (0, _pascalcase.default)((0, _rwPluralize.singularize)(name));
  let componentPath;
  let layoutPath;

  if (scaffoldPath === '') {
    componentPath = nestScaffoldByModel ? `src/components/${singularName}` : `src/components`;
    layoutPath = `src/layouts`;
  } else {
    const sP = scaffoldPath.split('/').map(_pascalcase.default).join('/');
    componentPath = nestScaffoldByModel ? `src/components/${sP}/${singularName}` : `src/components/${sP}`;
    layoutPath = `src/layouts/${sP}`;
  }

  return {
    importComponentName: `${componentPath}/${singularName}`,
    importComponentNameCell: `${componentPath}/${singularName}Cell`,
    importComponentEditNameCell: `${componentPath}/Edit${singularName}Cell`,
    importComponentNameForm: `${componentPath}/${singularName}Form`,
    importComponentNewName: `${componentPath}/New${singularName}`,
    importComponentNames: `${componentPath}/${pluralName}`,
    importComponentNamesCell: `${componentPath}/${pluralName}Cell`,
    importLayoutNames: `${layoutPath}/${pluralName}Layout`
  };
}; // Includes imports from getImportComponentNames()


const getTemplateStrings = (name, scaffoldPath, nestScaffoldByModel = true) => {
  const pluralPascalName = (0, _pascalcase.default)((0, _rwPluralize.pluralize)(name));
  const singularPascalName = (0, _pascalcase.default)((0, _rwPluralize.singularize)(name));
  const pluralCamelName = (0, _camelcase.default)(pluralPascalName);
  const singularCamelName = (0, _camelcase.default)(singularPascalName);
  const camelScaffoldPath = (0, _camelcase.default)((0, _pascalcase.default)(scaffoldPath));
  return {
    pluralRouteName: scaffoldPath === '' ? pluralCamelName : `${camelScaffoldPath}${pluralPascalName}`,
    editRouteName: scaffoldPath === '' ? `edit${singularPascalName}` : `${camelScaffoldPath}Edit${singularPascalName}`,
    singularRouteName: scaffoldPath === '' ? singularCamelName : `${camelScaffoldPath}${singularPascalName}`,
    newRouteName: scaffoldPath === '' ? `new${singularPascalName}` : `${camelScaffoldPath}New${singularPascalName}`,
    ...getImportComponentNames(name, scaffoldPath, nestScaffoldByModel)
  };
}; // Checks whether Tailwind is installed, and if the `flag` argument is not
// already set, returns true. Otherwise just returns `flag`


const shouldUseTailwindCSS = flag => {
  if (flag === undefined) {
    return _fs.default.existsSync(_path.default.join((0, _lib.getPaths)().web.config, 'tailwind.config.js'));
  } else {
    return flag;
  }
};

exports.shouldUseTailwindCSS = shouldUseTailwindCSS;

const files = async ({
  model: name,
  path: scaffoldPath = '',
  tests = true,
  typescript = false,
  tailwind = false,
  nestScaffoldByModel
}) => {
  const model = await (0, _schemaHelpers.getSchema)(name);

  if (typeof nestScaffoldByModel === 'undefined') {
    nestScaffoldByModel = (0, _config.getConfig)().generate.nestScaffoldByModel;
  }

  const templateStrings = getTemplateStrings(name, scaffoldPath, nestScaffoldByModel);
  const pascalScaffoldPath = scaffoldPath === '' ? scaffoldPath : scaffoldPath.split('/').map(_pascalcase.default).join('/') + '/';
  return { ...(await componentFiles(name, pascalScaffoldPath, typescript, nestScaffoldByModel, templateStrings)),
    ...(await (0, _sdl.files)({ ...(0, _lib.getDefaultArgs)(_sdl.builder),
      name,
      typescript
    })),
    ...(await (0, _service.files)({ ...(0, _lib.getDefaultArgs)(_service.builder),
      name,
      crud: true,
      relations: (0, _helpers.relationsForModel)(model),
      tests,
      typescript
    })),
    ...assetFiles(name, tailwind),
    ...layoutFiles(name, pascalScaffoldPath, typescript, templateStrings),
    ...(await pageFiles(name, pascalScaffoldPath, typescript, nestScaffoldByModel, templateStrings))
  };
};

exports.files = files;

const assetFiles = (name, tailwind) => {
  let fileList = {};

  const assets = _fs.default.readdirSync((0, _helpers.customOrDefaultTemplatePath)({
    side: 'web',
    generator: 'scaffold',
    templatePath: 'assets'
  }));

  assets.forEach(asset => {
    // check if the asset name matches the Tailwind preference
    if (tailwind && asset.match(/tailwind/) || !tailwind && !asset.match(/tailwind/)) {
      const outputAssetName = asset.replace(/\.template/, '').replace(/\.tailwind/, '');

      const outputPath = _path.default.join((0, _lib.getPaths)().web.src, outputAssetName); // skip assets that already exist on disk, never worry about overwriting


      if (!SKIPPABLE_ASSETS.includes(_path.default.basename(outputPath)) || !_fs.default.existsSync(outputPath)) {
        const template = (0, _lib.generateTemplate)((0, _helpers.customOrDefaultTemplatePath)({
          side: 'web',
          generator: 'scaffold',
          templatePath: _path.default.join('assets', asset)
        }), {
          name
        });
        fileList[outputPath] = template;
      }
    }
  });
  return fileList;
};

const layoutFiles = (name, pascalScaffoldPath = '', generateTypescript, templateStrings) => {
  const pluralName = (0, _pascalcase.default)((0, _rwPluralize.pluralize)(name));
  const singularName = (0, _pascalcase.default)((0, _rwPluralize.singularize)(name));
  let fileList = {};

  const layouts = _fs.default.readdirSync((0, _helpers.customOrDefaultTemplatePath)({
    side: 'web',
    generator: 'scaffold',
    templatePath: 'layouts'
  }));

  layouts.forEach(layout => {
    const outputLayoutName = layout.replace(/Names/, pluralName).replace(/Name/, singularName).replace(/\.tsx\.template/, generateTypescript ? '.tsx' : '.js');

    const outputPath = _path.default.join((0, _lib.getPaths)().web.layouts, pascalScaffoldPath, outputLayoutName.replace(/\.(js|tsx?)/, ''), outputLayoutName);

    const template = (0, _lib.generateTemplate)((0, _helpers.customOrDefaultTemplatePath)({
      side: 'web',
      generator: 'scaffold',
      templatePath: _path.default.join('layouts', layout)
    }), {
      name,
      pascalScaffoldPath,
      ...templateStrings
    });
    fileList[outputPath] = generateTypescript ? template : (0, _lib.transformTSToJS)(outputPath, template);
  });
  return fileList;
};

const pageFiles = async (name, pascalScaffoldPath = '', generateTypescript, nestScaffoldByModel = true, templateStrings) => {
  const pluralName = (0, _pascalcase.default)((0, _rwPluralize.pluralize)(name));
  const singularName = (0, _pascalcase.default)((0, _rwPluralize.singularize)(name));
  const model = await (0, _schemaHelpers.getSchema)(singularName);
  const idType = getIdType(model);
  const idTsType = (0, _helpers.mapPrismaScalarToPagePropTsType)(idType);
  let fileList = {};

  const pages = _fs.default.readdirSync((0, _helpers.customOrDefaultTemplatePath)({
    side: 'web',
    generator: 'scaffold',
    templatePath: 'pages'
  }));

  pages.forEach(page => {
    // Sanitize page names
    const outputPageName = page.replace(/Names/, pluralName).replace(/Name/, singularName).replace(/\.tsx\.template/, generateTypescript ? '.tsx' : '.js');
    const finalFolder = (nestScaffoldByModel ? singularName + '/' : '') + outputPageName.replace(/\.(js|tsx?)/, '');

    const outputPath = _path.default.join((0, _lib.getPaths)().web.pages, pascalScaffoldPath, finalFolder, outputPageName);

    const template = (0, _lib.generateTemplate)((0, _helpers.customOrDefaultTemplatePath)({
      side: 'web',
      generator: 'scaffold',
      templatePath: _path.default.join('pages', page)
    }), {
      idTsType,
      name,
      pascalScaffoldPath,
      ...templateStrings
    });
    fileList[outputPath] = generateTypescript ? template : (0, _lib.transformTSToJS)(outputPath, template);
  });
  return fileList;
};

const componentFiles = async (name, pascalScaffoldPath = '', generateTypescript, nestScaffoldByModel = true, templateStrings) => {
  const pluralName = (0, _pascalcase.default)((0, _rwPluralize.pluralize)(name));
  const singularName = (0, _pascalcase.default)((0, _rwPluralize.singularize)(name));
  const model = await (0, _schemaHelpers.getSchema)(singularName);
  const idType = getIdType(model);
  const intForeignKeys = (0, _helpers.intForeignKeysForModel)(model);
  let fileList = {};
  const componentMetadata = {
    Enum: {
      componentName: 'RadioField',
      defaultProp: 'defaultChecked',
      validation: () => false,
      listDisplayFunction: 'formatEnum',
      displayFunction: 'formatEnum'
    },
    EnumList: {
      componentName: 'CheckboxField',
      defaultProp: 'defaultChecked',
      validation: () => false,
      listDisplayFunction: 'formatEnum',
      displayFunction: 'formatEnum'
    },
    Boolean: {
      componentName: 'CheckboxField',
      defaultProp: 'defaultChecked',
      validation: () => false,
      listDisplayFunction: 'checkboxInputTag',
      displayFunction: 'checkboxInputTag'
    },
    DateTime: {
      componentName: 'DatetimeLocalField',
      deserializeFunction: 'formatDatetime',
      listDisplayFunction: 'timeTag',
      displayFunction: 'timeTag'
    },
    Int: {
      componentName: 'NumberField'
    },
    Json: {
      componentName: 'TextAreaField',
      validation: isRequired => `{{ valueAsJSON: true${isRequired ? ', required: true' : ''} }}`,
      displayFunction: 'jsonDisplay',
      listDisplayFunction: 'jsonTruncate',
      deserializeFunction: 'JSON.stringify'
    },
    Float: {
      validation: isRequired => `{{ valueAsNumber: true${isRequired ? ', required: true' : ''} }}`
    },
    Decimal: {
      validation: isRequired => `{{ valueAsNumber: true${isRequired ? ', required: true' : ''} }}`
    },
    default: {
      componentName: 'TextField',
      defaultProp: 'defaultValue',
      deserializeFunction: '',
      validation: '{{ required: true }}',
      displayFunction: undefined,
      listDisplayFunction: 'truncate'
    }
  };
  const columns = model.fields.filter(field => field.kind !== 'object').map(column => {
    var _componentMetadata$co, _componentMetadata$me, _componentMetadata$me2, _componentMetadata$me3, _componentMetadata$me4, _componentMetadata$me5;

    let validation;

    if ((_componentMetadata$co = componentMetadata[column.type]) !== null && _componentMetadata$co !== void 0 && _componentMetadata$co.validation) {
      var _componentMetadata$co2;

      validation = (_componentMetadata$co2 = componentMetadata[column.type]) === null || _componentMetadata$co2 === void 0 ? void 0 : _componentMetadata$co2.validation(column === null || column === void 0 ? void 0 : column.isRequired);
    } else {
      validation = column !== null && column !== void 0 && column.isRequired ? componentMetadata.default.validation : null;
    }

    const isEnum = column.kind === 'enum';
    const isList = column.isList;
    const enumType = isEnum && isList ? 'EnumList' : 'Enum';
    const metadataKey = isEnum ? enumType : column.type;
    return { ...column,
      label: (0, _humanizeString.default)(column.name),
      component: ((_componentMetadata$me = componentMetadata[metadataKey]) === null || _componentMetadata$me === void 0 ? void 0 : _componentMetadata$me.componentName) || componentMetadata.default.componentName,
      defaultProp: ((_componentMetadata$me2 = componentMetadata[metadataKey]) === null || _componentMetadata$me2 === void 0 ? void 0 : _componentMetadata$me2.defaultProp) || componentMetadata.default.defaultProp,
      deserializeFunction: ((_componentMetadata$me3 = componentMetadata[metadataKey]) === null || _componentMetadata$me3 === void 0 ? void 0 : _componentMetadata$me3.deserializeFunction) || componentMetadata.default.deserializeFunction,
      validation,
      listDisplayFunction: ((_componentMetadata$me4 = componentMetadata[metadataKey]) === null || _componentMetadata$me4 === void 0 ? void 0 : _componentMetadata$me4.listDisplayFunction) || componentMetadata.default.listDisplayFunction,
      displayFunction: ((_componentMetadata$me5 = componentMetadata[metadataKey]) === null || _componentMetadata$me5 === void 0 ? void 0 : _componentMetadata$me5.displayFunction) || componentMetadata.default.displayFunction,
      values: column.enumValues || [],
      isList,
      isEnum
    };
  });
  const editableColumns = columns.filter(column => {
    return NON_EDITABLE_COLUMNS.indexOf(column.name) === -1;
  }).filter(filterAutoGeneratedColumnsForScaffold);
  const fieldsToImport = Object.keys(editableColumns.reduce((accumulator, column) => {
    accumulator[column.component] = true;
    return accumulator;
  }, {}));

  if (!fieldsToImport.length) {
    throw new Error(`There are no editable fields in the ${name} model`);
  }

  const components = _fs.default.readdirSync((0, _helpers.customOrDefaultTemplatePath)({
    side: 'web',
    generator: 'scaffold',
    templatePath: 'components'
  }));

  await (0, _lib.asyncForEach)(components, component => {
    const outputComponentName = component.replace(/Names/, pluralName).replace(/Name/, singularName).replace(/\.tsx\.template/, generateTypescript ? '.tsx' : '.js');
    const finalFolder = (nestScaffoldByModel ? singularName + '/' : '') + outputComponentName.replace(/\.(js|tsx?)/, '');

    const outputPath = _path.default.join((0, _lib.getPaths)().web.components, pascalScaffoldPath, finalFolder, outputComponentName);

    const template = (0, _lib.generateTemplate)((0, _helpers.customOrDefaultTemplatePath)({
      side: 'web',
      generator: 'scaffold',
      templatePath: _path.default.join('components', component)
    }), {
      name,
      columns,
      fieldsToImport,
      editableColumns,
      idType,
      intForeignKeys,
      pascalScaffoldPath,
      ...templateStrings
    });
    fileList[outputPath] = generateTypescript ? template : (0, _lib.transformTSToJS)(outputPath, template);
  });
  return fileList;
}; // add routes for all pages


const routes = async ({
  model: name,
  path: scaffoldPath = '',
  nestScaffoldByModel
}) => {
  if (typeof nestScaffoldByModel === 'undefined') {
    nestScaffoldByModel = (0, _config.getConfig)().generate.nestScaffoldByModel;
  }

  const templateNames = getTemplateStrings(name, scaffoldPath);
  const singularPascalName = (0, _pascalcase.default)((0, _rwPluralize.singularize)(name));
  const pluralPascalName = (0, _pascalcase.default)((0, _rwPluralize.pluralize)(name));
  const pluralParamName = (0, _paramCase.paramCase)(pluralPascalName);
  const model = await (0, _schemaHelpers.getSchema)(singularPascalName);
  const idRouteParam = getIdType(model) === 'Int' ? ':Int' : '';
  const paramScaffoldPath = scaffoldPath === '' ? scaffoldPath : scaffoldPath.split('/').map(_paramCase.paramCase).join('/') + '/';
  const pascalScaffoldPath = (0, _pascalcase.default)(scaffoldPath);
  const pageRoot = pascalScaffoldPath + (nestScaffoldByModel ? singularPascalName : '');
  return [// new
  `<Route path="/${paramScaffoldPath}${pluralParamName}/new" page={${pageRoot}New${singularPascalName}Page} name="${templateNames.newRouteName}" />`, // edit
  `<Route path="/${paramScaffoldPath}${pluralParamName}/{id${idRouteParam}}/edit" page={${pageRoot}Edit${singularPascalName}Page} name="${templateNames.editRouteName}" />`, // singular
  `<Route path="/${paramScaffoldPath}${pluralParamName}/{id${idRouteParam}}" page={${pageRoot}${singularPascalName}Page} name="${templateNames.singularRouteName}" />`, // plural
  `<Route path="/${paramScaffoldPath}${pluralParamName}" page={${pageRoot}${pluralPascalName}Page} name="${templateNames.pluralRouteName}" />`];
};

exports.routes = routes;

const addRoutesInsideSetToRouter = async (model, path) => {
  const pluralPascalName = (0, _pascalcase.default)((0, _rwPluralize.pluralize)(model));
  const layoutName = `${pluralPascalName}Layout`;
  return (0, _lib.addRoutesToRouterTask)(await routes({
    model,
    path
  }), layoutName);
};

const addLayoutImport = ({
  model: name,
  path: scaffoldPath = ''
}) => {
  const pluralPascalName = (0, _pascalcase.default)((0, _rwPluralize.pluralize)(name));
  const pascalScaffoldPath = scaffoldPath === '' ? scaffoldPath : scaffoldPath.split('/').map(_pascalcase.default).join('/') + '/';
  const layoutName = `${pluralPascalName}Layout`;
  const importLayout = `import ${pluralPascalName}Layout from 'src/layouts/${pascalScaffoldPath}${layoutName}'`;
  const routesPath = (0, _lib.getPaths)().web.routes;
  const routesContent = (0, _lib.readFile)(routesPath).toString();

  if (!routesContent.match(importLayout)) {
    const newRoutesContent = routesContent.replace(/['"]@redwoodjs\/router['"](\s*)/, `'@redwoodjs/router'\n\n${importLayout}$1`);
    (0, _lib.writeFile)(routesPath, newRoutesContent, {
      overwriteExisting: true
    });
    return 'Added layout import to Routes.{js,tsx}';
  } else {
    return 'Layout import already exists in Routes.{js,tsx}';
  }
};

const addSetImport = task => {
  const routesPath = (0, _lib.getPaths)().web.routes;
  const routesContent = (0, _lib.readFile)(routesPath).toString();
  const [redwoodRouterImport, importStart, spacing, importContent, importEnd] = routesContent.match(/(import {)(\s*)([^]*)(} from ['"]@redwoodjs\/router['"])/) || [];

  if (!redwoodRouterImport) {
    task.skip("Couldn't add Set import from @redwoodjs/router to Routes.{js,tsx}");
    return undefined;
  }

  const routerImports = importContent.replace(/\s/g, '').split(',');

  if (routerImports.includes(PACKAGE_SET)) {
    return 'Skipping Set import';
  }

  const newRoutesContent = routesContent.replace(redwoodRouterImport, importStart + spacing + PACKAGE_SET + `,` + spacing + importContent + importEnd);
  (0, _lib.writeFile)(routesPath, newRoutesContent, {
    overwriteExisting: true
  });
  return 'Added Set import to Routes.{js,tsx}';
};

const command = 'scaffold <model>';
exports.command = command;
const description = 'Generate Pages, SDL, and Services files based on a given DB schema Model. Also accepts <path/model>';
exports.description = description;

const builder = yargs => {
  yargs.positional('model', {
    description: "Model to scaffold. You can also use <path/model> to nest files by type at the given path directory (or directories). For example, 'rw g scaffold admin/post'"
  }).option('tests', {
    description: 'Generate test files',
    type: 'boolean'
  }).option('tailwind', {
    description: 'Generate TailwindCSS version of scaffold.css (automatically set to `true` if TailwindCSS config exists)',
    type: 'boolean'
  }).epilogue(`Also see the ${(0, _terminalLink.default)('Redwood CLI Reference', 'https://redwoodjs.com/docs/cli-commands#generate-scaffold')}`); // Merge generator defaults in

  Object.entries(_generate2.yargsDefaults).forEach(([option, config]) => {
    yargs.option(option, config);
  });
};

exports.builder = builder;

const tasks = ({
  model,
  path,
  force,
  tests,
  typescript,
  javascript,
  tailwind
}) => {
  return new _listr.default([{
    title: 'Generating scaffold files...',
    task: async () => {
      const f = await files({
        model,
        path,
        tests,
        typescript,
        javascript,
        tailwind
      });
      return (0, _lib.writeFilesTask)(f, {
        overwriteExisting: force
      });
    }
  }, {
    title: 'Adding layout import...',
    task: async () => addLayoutImport({
      model,
      path
    })
  }, {
    title: 'Adding set import...',
    task: async (_, task) => addSetImport(task)
  }, {
    title: 'Adding scaffold routes...',
    task: async () => addRoutesInsideSetToRouter(model, path)
  }, {
    title: 'Adding scaffold asset imports...',
    task: () => (0, _lib.addScaffoldImport)()
  }, {
    title: `Generating types ...`,
    task: _generate.generate
  }], {
    collapse: false,
    exitOnError: true
  });
};

exports.tasks = tasks;

const handler = async ({
  model: modelArg,
  force,
  tests,
  typescript,
  tailwind
}) => {
  if (tests === undefined) {
    tests = (0, _config.getConfig)().generate.tests;
  }

  const {
    model,
    path
  } = splitPathAndModel(modelArg);
  tailwind = shouldUseTailwindCSS(tailwind);

  try {
    const {
      name
    } = await (0, _schemaHelpers.verifyModelName)({
      name: model
    });
    const t = tasks({
      model: name,
      path,
      force,
      tests,
      typescript,
      tailwind
    });
    await t.run();
  } catch (e) {
    console.log(_colors.default.error(e.message));
    process.exit((e === null || e === void 0 ? void 0 : e.existCode) || 1);
  }
};

exports.handler = handler;

const splitPathAndModel = pathSlashModel => {
  const path = pathSlashModel.split('/').slice(0, -1).join('/'); // This code will work whether or not there's a path in model
  // E.g. if model is just 'post',
  // path.split('/') will return ['post'].

  const model = pathSlashModel.split('/').pop();
  return {
    model,
    path
  };
};

exports.splitPathAndModel = splitPathAndModel;