"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.handler = exports.description = exports.command = exports.builder = void 0;

var _reverse = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reverse"));

var _findIndex = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find-index"));

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/splice"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _chalk = _interopRequireDefault(require("chalk"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _telemetry = require("@redwoodjs/telemetry");

var _lib = require("../../../lib");

var _colors = _interopRequireDefault(require("../../../lib/colors"));

var _configureStorybook = _interopRequireDefault(require("../../../lib/configureStorybook.js"));

const command = 'i18n';
exports.command = command;
const description = 'Set up i18n';
exports.description = description;

const builder = yargs => {
  yargs.option('force', {
    alias: 'f',
    default: false,
    description: 'Overwrite existing configuration',
    type: 'boolean'
  });
};

exports.builder = builder;
const APP_JS_PATH = (0, _lib.getPaths)().web.app;

const i18nImportExist = appJS => {
  let content = appJS.toString();

  const hasBaseImport = () => /import '.\/i18n'/.test(content);

  return hasBaseImport();
};

const addI18nImport = appJS => {
  var _context;

  var content = (0, _reverse.default)(_context = appJS.toString().split('\n')).call(_context);
  const index = (0, _findIndex.default)(content).call(content, value => /import/.test(value));
  (0, _splice.default)(content).call(content, index, 0, "import './i18n'");
  return (0, _reverse.default)(content).call(content).join(`\n`);
};

const i18nConfigExists = () => {
  return _fs.default.existsSync(_path.default.join((0, _lib.getPaths)().web.src, 'i18n.js'));
};

const localesExists = lng => {
  return _fs.default.existsSync(_path.default.join((0, _lib.getPaths)().web.src, 'locales', lng + '.json'));
};

const handler = async ({
  force
}) => {
  const tasks = new _listr.default([{
    title: 'Installing packages...',
    task: async () => {
      return new _listr.default([{
        title: 'Install i18n, i18next, react-i18next and i18next-browser-languagedetector',
        task: async () => {
          /**
           * Install i18n, i18next, react-i18next and i18next-browser-languagedetector
           */
          await (0, _execa.default)('yarn', ['workspace', 'web', 'add', 'i18n', 'i18next', 'react-i18next', 'i18next-browser-languagedetector']);
        }
      }]);
    }
  }, {
    title: 'Configure i18n...',
    task: () => {
      /**
       *  Write i18n.js in web/src
       *
       * Check if i18n config already exists.
       * If it exists, throw an error.
       */
      if (!force && i18nConfigExists()) {
        throw new Error('i18n config already exists.\nUse --force to override existing config.');
      } else {
        return (0, _lib.writeFile)(_path.default.join((0, _lib.getPaths)().web.src, 'i18n.js'), _fs.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'i18n.js.template')).toString(), {
          overwriteExisting: force
        });
      }
    }
  }, {
    title: 'Adding locale file for French...',
    task: () => {
      /**
       * Make web/src/locales if it doesn't exist
       * and write fr.json there
       *
       * Check if fr.json already exists.
       * If it exists, throw an error.
       */
      if (!force && localesExists('fr')) {
        throw new Error('fr.json config already exists.\nUse --force to override existing config.');
      } else {
        return (0, _lib.writeFile)(_path.default.join((0, _lib.getPaths)().web.src, '/locales/fr.json'), _fs.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'fr.json.template')).toString(), {
          overwriteExisting: force
        });
      }
    }
  }, {
    title: 'Adding locale file for English...',
    task: () => {
      /**
       * Make web/src/locales if it doesn't exist
       * and write en.json there
       *
       * Check if en.json already exists.
       * If it exists, throw an error.
       */
      if (!force && localesExists('en')) {
        throw new Error('en.json already exists.\nUse --force to override existing config.');
      } else {
        return (0, _lib.writeFile)(_path.default.join((0, _lib.getPaths)().web.src, '/locales/en.json'), _fs.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'en.json.template')).toString(), {
          overwriteExisting: force
        });
      }
    }
  }, {
    title: 'Adding import to App.{js,tsx}...',
    task: (_ctx, task) => {
      /**
       * Add i18n import to the last import of App.{js,tsx}
       *
       * Check if i18n import already exists.
       * If it exists, throw an error.
       */
      let appJS = _fs.default.readFileSync(APP_JS_PATH);

      if (i18nImportExist(appJS)) {
        task.skip('Import already exists in App.js');
      } else {
        _fs.default.writeFileSync(APP_JS_PATH, addI18nImport(appJS));
      }
    }
  }, {
    title: 'Configuring Storybook...',
    task: async () => (0, _configureStorybook.default)({
      force
    }, _fs.default.readFileSync(_path.default.join(__dirname, 'templates', 'storybook.preview.js.template'), 'utf-8'))
  }, {
    title: 'One more thing...',
    task: (_ctx, task) => {
      task.title = `One more thing...\n
          ${_colors.default.green('Quick link to the docs:')}\n
          ${_chalk.default.hex('#e8e8e8')('https://react.i18next.com/guides/quick-start/')}
        `;
    }
  }]);

  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
};

exports.handler = handler;