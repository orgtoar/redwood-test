"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
_Object$defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = void 0;
var _reverse = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reverse"));
var _findIndex = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find-index"));
var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/splice"));
var _path = _interopRequireDefault(require("path"));
var _chalk = _interopRequireDefault(require("chalk"));
var _execa = _interopRequireDefault(require("execa"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _listr = require("listr2");
var _telemetry = require("@redwoodjs/telemetry");
var _lib = require("../../../lib");
var _colors = _interopRequireDefault(require("../../../lib/colors"));
var _configureStorybook = _interopRequireDefault(require("../../../lib/configureStorybook.js"));
var _extendFile = require("../../../lib/extendFile");
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
  return _fsExtra.default.existsSync(_path.default.join((0, _lib.getPaths)().web.src, 'i18n.js'));
};
const localesExists = lng => {
  return _fsExtra.default.existsSync(_path.default.join((0, _lib.getPaths)().web.src, 'locales', lng + '.json'));
};
const handler = async ({
  force
}) => {
  const rwPaths = (0, _lib.getPaths)();
  const tasks = new _listr.Listr([{
    title: 'Installing packages...',
    task: async () => {
      return new _listr.Listr([{
        title: 'Install i18n, i18next, react-i18next and i18next-browser-languagedetector',
        task: async () => {
          /**
           * Install i18n, i18next, react-i18next and i18next-browser-languagedetector
           */
          await (0, _execa.default)('yarn', ['workspace', 'web', 'add', 'i18n', 'i18next', 'react-i18next', 'i18next-browser-languagedetector']);
        }
      }], {
        rendererOptions: {
          collapseSubtasks: false
        }
      });
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
        return (0, _lib.writeFile)(_path.default.join((0, _lib.getPaths)().web.src, 'i18n.js'), _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'i18n.js.template')).toString(), {
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
        return (0, _lib.writeFile)(_path.default.join((0, _lib.getPaths)().web.src, '/locales/fr.json'), _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'fr.json.template')).toString(), {
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
        return (0, _lib.writeFile)(_path.default.join((0, _lib.getPaths)().web.src, '/locales/en.json'), _fsExtra.default.readFileSync(_path.default.resolve(__dirname, 'templates', 'en.json.template')).toString(), {
          overwriteExisting: force
        });
      }
    }
  }, {
    title: 'Adding import to App.{jsx,tsx}...',
    task: (_ctx, task) => {
      /**
       * Add i18n import to the last import of App.{jsx,tsx}
       *
       * Check if i18n import already exists.
       * If it exists, throw an error.
       */
      let appJS = _fsExtra.default.readFileSync(APP_JS_PATH);
      if (i18nImportExist(appJS)) {
        task.skip('Import already exists in App.js');
      } else {
        _fsExtra.default.writeFileSync(APP_JS_PATH, addI18nImport(appJS));
      }
    }
  }, {
    title: 'Configuring Storybook...',
    // skip this task if the user's storybook config already includes "withI18n"
    skip: () => (0, _extendFile.fileIncludes)(rwPaths.web.storybookConfig, 'withI18n'),
    task: async () => (0, _configureStorybook.default)(_path.default.join(__dirname, 'templates', 'storybook.preview.tsx.template'))
  }, {
    title: 'One more thing...',
    task: (_ctx, task) => {
      task.title = `One more thing...\n
          ${_colors.default.green('Quick link to the docs:')}\n
          ${_chalk.default.hex('#e8e8e8')('https://react.i18next.com/guides/quick-start/')}
        `;
    }
  }], {
    rendererOptions: {
      collapseSubtasks: false
    }
  });
  try {
    await tasks.run();
  } catch (e) {
    (0, _telemetry.errorTelemetry)(process.argv, e.message);
    console.error(_colors.default.error(e.message));
    process.exit(e?.exitCode || 1);
  }
};
exports.handler = handler;